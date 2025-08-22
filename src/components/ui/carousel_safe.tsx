import * as React from "react"
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type CarouselApi = UseEmblaCarouselType[1]

type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }
  return context
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        loop: opts?.loop ?? true,
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins
    )
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) return
      try {
        const snaps = api.scrollSnapList()
        const selected = api.selectedScrollSnap()
        const canPrev = api.canScrollPrev()
        const canNext = api.canScrollNext()
        // eslint-disable-next-line no-console
        console.log("[Embla] select/reInit", { canPrev, canNext, snaps, selected })
      } catch {
        // ignore
      }
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }, [])

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev()
    }, [api])

    const scrollNext = React.useCallback(() => {
      api?.scrollNext()
    }, [api])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault()
          scrollPrev()
        } else if (event.key === "ArrowRight") {
          event.preventDefault()
          scrollNext()
        }
      },
      [scrollPrev, scrollNext]
    )

    React.useEffect(() => {
      if (!api || !setApi) return
      setApi(api)
    }, [api, setApi])

    React.useEffect(() => {
      if (!api) return
      try {
        const snaps = api.scrollSnapList()
        const selected = api.selectedScrollSnap()
        const canPrev = api.canScrollPrev()
        const canNext = api.canScrollNext()
        // eslint-disable-next-line no-console
        console.log("[Embla] init", { canPrev, canNext, snaps, selected })
      } catch {
        // ignore
      }
      onSelect(api)
      api.on("reInit", onSelect)
      api.on("select", onSelect)
      return () => {
        api?.off("select", onSelect)
        api?.off("reInit", onSelect)
      }
    }, [api, onSelect])

    // Force reInit when images inside the carousel load (incl. lazy-loaded)
    React.useEffect(() => {
      if (!api) return

      // Try to detect the viewport element from the ref (only if it's an Element)
      const maybeViewportUnknown = carouselRef as unknown as unknown
      let viewportEl: Element | null = null
      if (maybeViewportUnknown && typeof maybeViewportUnknown === 'object') {
        const obj = maybeViewportUnknown as Record<string, unknown>
        if ('querySelectorAll' in obj) {
          viewportEl = obj as unknown as Element
        }
      }

      if (!viewportEl) return

      const images = Array.from(viewportEl.querySelectorAll('img')) as HTMLImageElement[]
      if (images.length === 0) return

      let timeout: number | undefined
      const reinit = () => {
        if (typeof window !== 'undefined') {
          if (timeout) window.clearTimeout(timeout)
          timeout = window.setTimeout(() => {
            api.reInit()
          }, 50)
        } else {
          try { api.reInit() } catch { /* noop */ }
        }
      }

      images.forEach((img) => {
        if (img.complete) {
          reinit()
        } else {
          img.addEventListener('load', reinit, { once: true })
          img.addEventListener('error', reinit, { once: true })
        }
      })

      return () => {
        if (typeof window !== 'undefined' && timeout) window.clearTimeout(timeout)
      }
    }, [api, carouselRef, children])

    // Reinitialize Embla on resize/viewport changes
    React.useEffect(() => {
      if (!api) return
      const maybeViewportUnknown = carouselRef as unknown as unknown
      let viewportEl: Element | null = null
      if (maybeViewportUnknown && typeof maybeViewportUnknown === 'object') {
        const obj = maybeViewportUnknown as Record<string, unknown>
        if ('nodeType' in obj) {
          viewportEl = obj as unknown as Element
        }
      }

      if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined' || !viewportEl) {
        return
      }

      const ro = new ResizeObserver(() => {
        api.reInit()
      })
      ro.observe(viewportEl as Element)

      const onWinResize = () => api.reInit()
      window.addEventListener('resize', onWinResize)

      return () => {
        ro.disconnect()
        window.removeEventListener('resize', onWinResize)
      }
    }, [api, carouselRef])

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { viewportClassName?: string }
>(({ className, viewportClassName, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div ref={carouselRef} className={cn("overflow-hidden touch-pan-y", viewportClassName)}>
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute z-50 h-8 w-8 rounded-full pointer-events-auto",
        orientation === "horizontal"
          ? "left-2 top-1/2 -translate-y-1/2"
          : "top-2 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute z-50 h-8 w-8 rounded-full pointer-events-auto",
        orientation === "horizontal"
          ? "right-2 top-1/2 -translate-y-1/2"
          : "bottom-2 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext"

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
