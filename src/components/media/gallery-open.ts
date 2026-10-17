/**
 * The hook a Gallery exposes so that another component (the Lightbox) can open
 * its images.
 *
 * Every Gallery image is a link to its full-size version, so without
 * JavaScript, or with no listener, a click simply opens the photo. With
 * JavaScript, a plain click on an image dispatches a `gallery-open` event from
 * the Gallery root (the `ul`). The event bubbles, so a listener can sit on one
 * Gallery or on the document. A listener that shows the image calls
 * `event.preventDefault()` to claim it; the Gallery then cancels the link
 * navigation. Modified clicks (new tab, new window, download) are left to the
 * browser and dispatch nothing.
 *
 * ```ts
 * document.addEventListener(GALLERY_OPEN_EVENT, event => {
 *   event.preventDefault();
 *   const { index, images, trigger } = event.detail;
 *   // show images[index]; arrow keys move through images; on close, trigger.focus()
 * });
 * ```
 */
export const GALLERY_OPEN_EVENT = 'gallery-open';

/** One Gallery image, as a Lightbox needs it to show the full-size version. */
export interface GalleryImageDetail {
  /** URL of the full-size image (the link target). */
  src: string;
  alt: string;
  /** The plain-text credit, without the "©" prefix that Image adds. */
  credit?: string;
  /** Intrinsic size of the full-size image, when known. */
  width?: number;
  height?: number;
}

export interface GalleryOpenDetail {
  /** Position of the clicked image in `images`. */
  index: number;
  /** Every image of the Gallery, in display order, for previous/next. */
  images: GalleryImageDetail[];
  /** The link that was activated; focus returns to it when the viewer closes. */
  trigger: HTMLAnchorElement;
}

export type GalleryOpenEvent = CustomEvent<GalleryOpenDetail>;

declare global {
  interface HTMLElementEventMap {
    [GALLERY_OPEN_EVENT]: GalleryOpenEvent;
  }

  interface DocumentEventMap {
    [GALLERY_OPEN_EVENT]: GalleryOpenEvent;
  }
}

const GALLERY = '[data-gallery]';
const GALLERY_LINK = 'a[data-gallery-link]';

function toImageDetail(link: HTMLAnchorElement): GalleryImageDetail {
  const { credit, width, height } = link.dataset;

  return {
    src: link.href,
    alt: link.querySelector('img')?.alt ?? '',
    credit,
    width: width ? Number(width) : undefined,
    height: height ? Number(height) : undefined,
  };
}

/**
 * Turns plain clicks on Gallery links into `gallery-open` events. Installed
 * once per page by the Gallery component.
 */
export function handleGalleryClick(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  const link = (event.target as Element | null)?.closest<HTMLAnchorElement>(GALLERY_LINK);
  const gallery = link?.closest<HTMLElement>(GALLERY);

  if (!link || !gallery) {
    return;
  }

  const links = Array.from(gallery.querySelectorAll<HTMLAnchorElement>(GALLERY_LINK));
  const open: GalleryOpenEvent = new CustomEvent(GALLERY_OPEN_EVENT, {
    bubbles: true,
    cancelable: true,
    detail: { index: links.indexOf(link), images: links.map(toImageDetail), trigger: link },
  });

  if (!gallery.dispatchEvent(open)) {
    event.preventDefault();
  }
}
