"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Initial slider position for horizontal mode (center)
const INITIAL_HORIZONTAL_SLIDER_PERCENTAGE = 33;

interface ImageComparisonSliderProps {
  vImage: string; // Single image for small screens
  hAbove: string; // "Top" image for horizontal slider (left image)
  hBellow: string; // "Bottom" image for horizontal slider (right image)
  children?: React.ReactNode;
  breakpoint?: number; // Optional: custom breakpoint (default 768)
}

export const ImageComparisonSlider = ({
  vImage,
  hAbove,
  hBellow,
  children,
  breakpoint = 768, // Default to md breakpoint (768px)
}: ImageComparisonSliderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const topImageContainerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const sliderPercentageRef = useRef(INITIAL_HORIZONTAL_SLIDER_PERCENTAGE);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Determine if it's a small screen on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < breakpoint);
    };
    checkScreenSize(); // Initial check
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [breakpoint]);

  // Effect for horizontal slider logic
  useEffect(() => {
    // GUARANTEED EXIT: If on a small screen, do nothing.
    // This ensures no slider logic or event listeners are active.
    if (isSmallScreen) {
      return;
    }

    const container = containerRef.current;
    const topImageContainer = topImageContainerRef.current;
    const slider = sliderRef.current;

    if (!container || !topImageContainer || !slider) return;

    let isDragging = false;

    const setPositionBasedOnPercentage = (percentage: number) => {
      if (!container || !slider || !topImageContainer) return;
      const containerRect = container.getBoundingClientRect();
      const sliderX = (percentage / 100) * containerRect.width;

      slider.style.left = `${sliderX}px`;
      const clipValue = `inset(0 ${100 - percentage}% 0 0)`;
      topImageContainer.style.clipPath = clipValue;
      topImageContainer.style.setProperty("-webkit-clip-path", clipValue);
      sliderPercentageRef.current = percentage;
    };

    const updatePositionBasedOnClientX = (clientX: number) => {
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      let newRelativeX = clientX - containerRect.left;
      newRelativeX = Math.max(0, Math.min(newRelativeX, containerRect.width));
      const currentPercentage = (newRelativeX / containerRect.width) * 100;
      setPositionBasedOnPercentage(currentPercentage);
    };

    const onDrag = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const touchOrMouse = "touches" in e ? e.touches[0] : e;
      updatePositionBasedOnClientX(touchOrMouse.clientX);
    };

    const startDrag = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      e.preventDefault();
      slider.classList.add("dragging");
      onDrag(e); // Immediately move to position
    };

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      slider.classList.remove("dragging");
    };

    const handleResize = () =>
      setPositionBasedOnPercentage(sliderPercentageRef.current);

    // Add event listeners for horizontal slider
    container.addEventListener("mousedown", startDrag);
    container.addEventListener("touchstart", startDrag, { passive: false });

    document.addEventListener("mousemove", onDrag);
    document.addEventListener("touchmove", onDrag, { passive: false });

    document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchend", endDrag);

    window.addEventListener("resize", handleResize);

    // Initialize slider position
    setPositionBasedOnPercentage(sliderPercentageRef.current);

    return () => {
      // Cleanup all listeners
      container.removeEventListener("mousedown", startDrag);
      container.removeEventListener("touchstart", startDrag);
      document.removeEventListener("mousemove", onDrag);
      document.removeEventListener("touchmove", onDrag);
      document.removeEventListener("mouseup", endDrag);
      document.removeEventListener("touchend", endDrag);
      window.removeEventListener("resize", handleResize);
    };
  }, [isSmallScreen, breakpoint]); // Effect depends only on screen size

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[70vh] sm:h-[80vh] md:h-[90vh] overflow-hidden select-none"
      // Disable the horizontal drag cursor on small screens
      style={{ cursor: isSmallScreen ? "default" : "ew-resize" }}
    >
      {isSmallScreen ? (
        // --- SMALL SCREEN VIEW ---
        // Only the vertical image is rendered. No slider effects or extra images exist.
        <Image
          key={vImage}
          src={vImage}
          alt="Display Image"
          fill={true}
          priority
          className="absolute inset-0 object-cover z-10"
        />
      ) : (
        // --- LARGER SCREEN VIEW (SLIDER) ---
        <>
          {/* Bottom Image (hBellow) */}
          <Image
            key={hBellow}
            src={hBellow}
            alt="Comparison Base Image"
            fill={true}
            priority
            className="absolute inset-0 object-cover z-10"
          />
          {/* Container for Top Image (hAbove) - this one gets clipped */}
          <div ref={topImageContainerRef} className="absolute inset-0 z-20">
            <Image
              key={hAbove}
              src={hAbove}
              alt="Comparison Overlay Image"
              fill={true}
              priority
              className="object-cover"
            />
          </div>
          {/* Slider Handle and Line */}
          <div
            ref={sliderRef}
            className="absolute top-0 bottom-0 w-0.5 bg-white z-40 group"
            style={{ transform: "translateX(-50%)" }}
          >
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                         flex items-center justify-center size-20 md:size-16
                         transition-transform duration-150 group-hover:scale-110 active:scale-105`}
            >
              {children && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center text-white text-center p-4 pointer-events-auto">
                  {children}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* --- SHARED CHILDREN OVERLAY --- */}
      {/* This is rendered for BOTH screen sizes and is always on top (z-50) */}
      {children && isSmallScreen && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center text-white text-center p-4 pointer-events-none">
          <div className="pointer-events-auto">{children}</div>
        </div>
      )}
    </div>
  );
};
