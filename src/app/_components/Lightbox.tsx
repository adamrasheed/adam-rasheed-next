"use client";

import { ReactNode, useRef, useState } from "react";

const Lightbox = ({
  src,
  alt,
  children,
}: {
  src: string;
  alt: string;
  children: ReactNode;
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Mount the full-size image only once opened so closed lightboxes cost nothing.
  const [opened, setOpened] = useState(false);

  const open = () => {
    setOpened(true);
    dialogRef.current?.showModal();
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label={alt ? `View larger: ${alt}` : "View larger image"}
        className="block w-full cursor-zoom-in"
      >
        {children}
      </button>
      <dialog
        ref={dialogRef}
        aria-label={alt || "Image"}
        // A click on the backdrop lands on the dialog itself, not its children.
        onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
        className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-black/90"
      >
        <form method="dialog">
          <button
            type="submit"
            aria-label="Close"
            className="fixed right-4 top-4 text-3xl leading-none text-white"
          >
            &times;
          </button>
        </form>
        {opened && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} className="max-h-[90vh] max-w-[95vw] object-contain" />
        )}
      </dialog>
    </>
  );
};

export default Lightbox;
