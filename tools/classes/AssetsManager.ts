import { createRequire } from "node:module";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import got from "got";
import glob from "glob";
import { Metadata } from "./PresenceCompiler";
import { readFileSync } from "node:fs";
import FormData from "form-data";

const require = createRequire(import.meta.url),
	rootPath = resolve(fileURLToPath(new URL(".", import.meta.url)), "../.."),
	cdnBase = "https://cdn.rcd.gg";

export default class AssetsManager {
	cwd: string;

	constructor(
		public service: string,
		public options?: {
			cwd?: string;
		}
	) {
		this.cwd = options?.cwd ?? rootPath;
	}

	get assetBaseUrl() {
		return `${cdnBase}/PreMiD${encodeURI(
			this.presenceFolder.replace(this.cwd, "")
		).replace("#", "%23")}/assets`;
	}

	get presenceFolder() {
		return glob.sync(`{websites,programs}/**/${this.service}`, {
			absolute: true,
		})[0];
	}

	getFileExtension(url: string) {
		return extname(url);
	}

	get allTsFiles() {
		return glob
			.sync(`{websites,programs}/**/${this.service}/**/*.ts`, {
				absolute: true,
			})
			.filter(file => !file.endsWith(".d.ts"));
	}

	get metadata(): Metadata {
		return require(resolve(this.presenceFolder, "metadata.json"));
	}

	/**
	 * Gets all assets used in the presence
	 *
	 * Includes the logo, thumbnail, and all other assets used in the presence
	 *
	 * @note Includes both assets uploaded to the cdn, and assets that are not uploaded to the cdn
	 *
	 * @returns A list of all assets used in the presence
	 */
	get allAssets(): {
		logo: string;
		thumbnail: string;
		assets: Set<string>;
	} {
		const assets = new Set<string>(),
			{ logo, thumbnail } = this.metadata,
			files = this.allTsFiles;

		for (const tsfile of files) {
			const file = readFileSync(tsfile, "utf-8");

			//* A regex to match all image urls in the file
			const regex =
				/(?<=["'`])(https?:\/\/.*?\.(?:png|jpg|jpeg|gif|webp))(?=["'`])/g;
			let match: RegExpExecArray | null;

			while ((match = regex.exec(file)) !== null) {
				//* If the url contains a template literal, skip it
				if (match[1].includes(`\${`)) continue;

				//* Regex to check if the url contains + " or + ' or + `
				const regex2 = /(?<=\+ )["'`].*?["'`]/g;
				if (regex2.test(match[1])) continue;

				if (match[1] === logo || match[1] === thumbnail) continue;

				assets.add(match[1]);
			}
		}

		return {
			logo,
			thumbnail,
			assets,
		};
	}

	/**
	 * The assets should be uploaded to the following urls:
	 * - logo: getAssetBaseUrl()/logo.<extension>
	 * - thumbnail: getAssetBaseUrl()/thumbnail.<extension>
	 * - all other assets: getAssetBaseUrl()/<index>.<extension>
	 *
	 * The indexes should be kept in order, so if there are 3 assets, they should be uploaded to:
	 * - getAssetBaseUrl()/0.<extension>
	 * - getAssetBaseUrl()/1.<extension>
	 * - getAssetBaseUrl()/2.<extension>
	 *
	 * Any no longer used assets should be deleted from the cdn, so the cdn doesn't get filled with unused assets, and the indexes don't get messed up.
	 * So if there are 3 assets, and the 2nd one is no longer used, the 3rd asset should be moved to the 2nd index, and the 3rd index should be deleted.
	 * If for example the 1st asset is no longer used, but a new asset is added, the new asset should be uploaded to the 1st index, so the 2nd and 3rd don't even have to be moved. (This is the ideal situation, you can just pass the new asset to the toBeUploaded map, since the sync process will use a PUT request if the asset already exists)
	 *
	 * @todo
	 * - [x] Get all assets from the presence
	 * - [x] Get all assets from the cdn
	 * - [ ] Compare the assets from the presence with the assets from the cdn
	 *
	 * The update process should be as follows:
	 * - [ ] Delete all assets that are no longer used
	 * - [ ] Move assets to their new index (Upload to their new index, and delete the old index)
	 * - [ ] Upload all new assets
	 *
	 */
	async getAssetsChanges(): Promise<{
		toBeUploaded: Map<string, string>;
		toBeMoved: Map<string, string>;
		toBeDeleted: Set<string>;
	}> {
		const assets = this.allAssets,
			cdnAssets = await this.getCdnAssets(),
			result = {
				toBeUploaded: new Map<string, string>(),
				toBeMoved: new Map<string, string>(),
				toBeDeleted: new Set<string>(),
			};

		if (!cdnAssets.logo) {
			const newLogo = `${this.assetBaseUrl}/logo${this.getFileExtension(
				assets.logo
			)}`;
			result.toBeUploaded.set(assets.logo, newLogo);
		} else if (assets.logo !== cdnAssets.logo) {
			const newLogo = `${this.assetBaseUrl}/logo${this.getFileExtension(
				assets.logo
			)}`;

			//* If the logo has a different extension, delete the old logo
			if (!this.canBePut(cdnAssets.logo, newLogo))
				result.toBeDeleted.add(cdnAssets.logo);

			result.toBeUploaded.set(newLogo, cdnAssets.logo);
		}

		if (!cdnAssets.thumbnail) {
			const newThumbnail = `${
				this.assetBaseUrl
			}/thumbnail${this.getFileExtension(assets.thumbnail)}`;
			result.toBeUploaded.set(assets.thumbnail, newThumbnail);
		} else if (assets.thumbnail !== cdnAssets.thumbnail) {
			const newThumbnail = `${
				this.assetBaseUrl
			}/thumbnail${this.getFileExtension(assets.thumbnail)}`;

			//* If the thumbnail has a different extension, delete the old thumbnail
			if (!this.canBePut(cdnAssets.thumbnail, newThumbnail))
				result.toBeDeleted.add(cdnAssets.thumbnail);

			result.toBeUploaded.set(newThumbnail, cdnAssets.thumbnail);
		}

		return result;
	}

	async getCdnAssets(): Promise<{
		logo: string | false;
		thumbnail: string | false;
		assets: Map<number, string> | false;
	}> {
		const assets = new Map<number, string>();
		let assetFound = true,
			index = 0;
		while (assetFound) {
			const asset = await this.doesAssetExistAnyExtension(
				`${this.assetBaseUrl}/${index}`
			);
			if (asset) {
				assets.set(index, asset);
				index++;
			} else {
				assetFound = false;
			}
		}

		return {
			logo: await this.doesAssetExistAnyExtension(`${this.assetBaseUrl}/logo`),
			thumbnail: await this.doesAssetExistAnyExtension(
				`${this.assetBaseUrl}/thumbnail`
			),
			assets: assets.size ? assets : false,
		};
	}

	canBePut(oldUrl: string, newUrl: string): boolean {
		return this.getFileExtension(oldUrl) === this.getFileExtension(newUrl);
	}

	async doesAssetExist(url: string): Promise<boolean> {
		return got
			.head(url)
			.then(() => true)
			.catch(() => false);
	}

	async doesAssetExistAnyExtension(url: string): Promise<string | false> {
		const extensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
		for (const extension of extensions) {
			const newUrl = `${url}${extension}`;
			if (await this.doesAssetExist(newUrl)) return newUrl;
		}
		return false;
	}

	async uploadAssets(assets: Map<string, string>) {
		for (const [url, newUrl] of assets) {
			const extension = this.getFileExtension(url);
			let mimeType: string;
			switch (extension) {
				case ".png":
					mimeType = "image/png";
					break;
				case ".jpg":
				case ".jpeg":
					mimeType = "image/jpeg";
					break;
				case ".gif":
					mimeType = "image/gif";
					break;
				case ".webp":
					mimeType = "image/webp";
					break;
				default:
					throw new Error(`Unknown file extension: ${extension}`);
			}

			await got(url)
				.buffer()
				.then(async data => {
					const form = new FormData();
					form.append("file", data, {
						contentType: mimeType,
					});

					//* If the asset already exists, make a put request instead of a post request
					if (await this.doesAssetExist(newUrl)) {
						await got.put(newUrl, {
							body: form,
							headers: {
								...form.getHeaders(),
								Authorization: process.env.CDN_TOKEN,
							},
						});
					} else {
						await got.post(newUrl, {
							body: form,
							headers: {
								...form.getHeaders(),
								Authorization: process.env.CDN_TOKEN,
							},
						});
					}
				});
		}
	}

	async deleteAssets(assets: string[] | Set<string>) {
		for (const asset of assets) {
			if (!(await this.doesAssetExist(asset))) continue;
			await got.delete(asset, {
				headers: {
					Authorization: process.env.CDN_TOKEN,
				},
			});
		}
	}
}
