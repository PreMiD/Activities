export enum ActivityAssets {
  Logo = 'https://i.imgur.com/XXdgNCU.png',
}

export const presence = new Presence({
  clientId: '918337184929546322',
});

export const slideshow = presence.createSlideshow();

let currentCacheKey: unknown[] = [];
let currentCacheCallback: (() => void) | null = () => {};
let currentCacheDataStorage: object = {};
/**
 * Caches a method used to interact with browser APIs (eg MutationObserver) when the path changes.
 *
 * @param callback Function to run setup code on a certain path. Should return a cleanup function when path changes
 * @param dependenciesGetter Function to modify the dependency list if needed
 */
export function usePathCache<Data extends object>(
  callback: (storage: Data) => (() => void) | null,
  dependenciesGetter?: (baseDeps: string[]) => string[],
): Data {
  let dependencies = document.location.pathname.split('/').filter(Boolean);
  if (dependenciesGetter) {
    dependencies = dependenciesGetter(dependencies);
  }
  function executeChange() {
    currentCacheKey = structuredClone(dependencies);
    currentCacheCallback?.(); // execute cleanup function
    currentCacheDataStorage = {};
    const cb = callback(currentCacheDataStorage as Data);
    const recheckInterval = setInterval(() => {
      dependencies = document.location.pathname.split('/').filter(Boolean);
      if (dependenciesGetter) {
        dependencies = dependenciesGetter(dependencies);
      }
      verify();
    }, 1000);
    currentCacheCallback = () => {
      clearInterval(recheckInterval);
      cb?.();
    };
  }
  function verify() {
    if (dependencies.length !== currentCacheKey.length) {
      executeChange();
      return currentCacheDataStorage as Data;
    }
    for (let i = 0; i < dependencies.length; i++) {
      if (dependencies[i] !== currentCacheKey[i]) {
        executeChange();
        return currentCacheDataStorage as Data;
      }
    }
    return null;
  }
  const data = verify();
  if (data !== null) {
    return data;
  }
  // no change to dependencies, ignore
  return currentCacheDataStorage as Data;
}

const svgCache: Map<SVGElement, string> = new Map();
export function getSVGImageData(initialSvg: SVGElement): Promise<string> {
  if (svgCache.has(initialSvg))
    return Promise.resolve(svgCache.get(initialSvg)!);

  const clone = initialSvg.cloneNode(true) as SVGElement;
  const initialPaths = initialSvg.querySelectorAll('path');
  const clonePaths = clone.querySelectorAll('path');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const image = document.createElement('img');

  canvas.width = 512;
  canvas.height = 512;

  // To fix issues on some browsers like Firefox
  clone.setAttribute('width', '512');
  clone.setAttribute('height', '512');

  for (const [i, initialPath] of initialPaths.entries()) {
    const fillStyle = getComputedStyle(initialPath).fill;
    clonePaths[i]?.setAttribute('fill', fillStyle);
  }

  const xml = new XMLSerializer().serializeToString(clone);
  const svgURL = `data:image/svg+xml;base64,${btoa(xml)}`;

  return new Promise((resolve) => {
    image.onload = () => {
      ctx.drawImage(image, 0, 0, 512, 512);
      const data = canvas.toDataURL('image/png');
      svgCache.set(initialSvg, data);
      resolve(data);
    };
    image.src = svgURL;
  });
}

let oldSlideshowKey: string;
export function registerSlideshowKey(key: string): boolean {
  if (oldSlideshowKey !== key) {
    slideshow.deleteAllSlides();
    oldSlideshowKey = key;
    return true;
  }
  return false;
}

export function addButton(
  presenceData: PresenceData,
  button: ButtonData,
): void {
  if (presenceData.buttons) {
    if (presenceData.buttons.length < 2) {
      presenceData.buttons.push(button);
    }
  } else {
    presenceData.buttons = [button];
  }
}
