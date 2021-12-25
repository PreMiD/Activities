import "source-map-support/register";

import axios from "axios";
import {
  existsSync as exists,
  readFileSync as readFile,
  writeFileSync as writeFile
} from "fs";
import { sync as glob } from "glob";

/*  NOTE: THIS IS A TOOL THAT IS ONLY MEANT TO BE USED
    BY THE DEVS AND REVIEWERS FOR DEPLOYMENT PURPOSES,
    PLEASE DON'T COMPILE OR RUN IT BEFORE MAKING A PULL
    REQUEST UNLESS YOU'VE BEEN EXPLICITLY INSTRUCTED BY
    A DEV TO DO SO, WHICH WILL MOST LIKELY NEVER HAPPEN.  */

function isValidJSON(text: string): boolean {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

export const read = (path: string): string =>
    readFile(path, { encoding: "utf8" }),
  latestMetadataSchema = async () => {
    const latestVersion = (
      (
        await axios.get(
          "https://api.github.com/repos/PreMiD/Schemas/contents/schemas/metadata"
        )
      ).data as { name: string }[]
    )
      .filter(c => c.name.endsWith(".json"))
      .map(c => c.name.match(/\d.\d/g)[0])
      .pop() as `${number}.${number}`;
    return `https://schemas.premid.app/metadata/${latestVersion}` as const;
  },
  write = (path: string, code: Metadata): void =>
    writeFile(path, JSON.stringify(code, null, 2), {
      encoding: "utf8",
      flag: "w"
    });

(async function () {
  const missingMetadata: string[] = glob("./{websites,programs}/*/*/").filter(
      pF => !exists(`${pF}/dist/metadata.json`)
    ),
    allmeta: Array<[Metadata, string]> = glob(
      "./{websites,programs}/*/*/*/metadata.json"
    ).map(pF => {
      const file = read(pF);
      if (isValidJSON(file)) return [JSON.parse(file), pF];
      else {
        console.error(`Error. ${pF} is not a valid metadata file, skipping...`);
        return null;
      }
    }),
    latestSchema = await latestMetadataSchema();

  if (missingMetadata && missingMetadata.length > 0) {
    console.log(
      `\nThe following presence${
        missingMetadata.length > 1 ? "s don't" : "doesn't"
      } include a metadata file :\n${missingMetadata.join(", ")}\n`
    );
  }

  for (const metadata of allmeta) {
    if (metadata) {
      let newData = metadata[0];
      if (newData.$schema) {
        newData.$schema = latestSchema;
        write(metadata[1], newData);
      } else {
        try {
          newData = { ...{ $schema: latestSchema }, ...newData };
          write(metadata[1], newData);
        } catch (err) {
          console.log(err);
          continue;
        }
      }
    }
  }
})();

interface Metadata {
  $schema: string;
  service: string;
}
