import "./style.css";
import { EventEmitter } from "events"

export const imagesSequenceEmitter = new EventEmitter()

let loadedImages: HTMLImageElement[] = []

export const loadSequenceImages = () => {
  const tr1_2 = []
  for (let i = 0; i <= 23; i++) {
    const fileName = `./morphing/1-2/1-2${i.toString().padStart(2, "0")}.jpg`
    tr1_2.push(fileName)
  }
  const tr2_3 = []
  for (let i = 0; i <= 23; i++) {
    const fileName = `./morphing/2-3/2-3${i.toString().padStart(2, "0")}.jpg`
    tr2_3.push(fileName)
  }
  const tr3_4 = []
  for (let i = 0; i <= 23; i++) {
    const fileName = `./morphing/3-4/3-4${i.toString().padStart(2, "0")}.jpg`
    tr3_4.push(fileName)
  }
  const tr4_5 = []
  for (let i = 0; i <= 23; i++) {
    const fileName = `./morphing/4-5/4-5${i.toString().padStart(2, "0")}.jpg`
    tr4_5.push(fileName)
  }

  const tr5_6 = []
  for (let i = 0; i <= 23; i++) {
    const fileName = `./morphing/5-6/5-6${i.toString().padStart(2, "0")}.jpg`
    tr5_6.push(fileName)
  }

  const tr6_7 = []
  for (let i = 0; i <= 23; i++) {
    const fileName = `./morphing/6-7/6-7${i.toString().padStart(2, "0")}.jpg`
    tr6_7.push(fileName)
  }

  const tr7_8 = []
  for (let i = 0; i <= 23; i++) {
    const fileName = `./morphing/7-8/7-8${i.toString().padStart(2, "0")}.jpg`
    tr7_8.push(fileName)
  }

  const tr8_9 = []
  for (let i = 0; i <= 23; i++) {
    const fileName = `./morphing/8-9/8-9${i.toString().padStart(2, "0")}.jpg`
    tr8_9.push(fileName)
  }

  const tr9_1 = []
  for (let i = 0; i <= 23; i++) {
    const fileName = `./morphing/9-1/9-1${i.toString().padStart(2, "0")}.jpg`
    tr9_1.push(fileName)
  }


  const images = [...tr1_2, ...tr2_3, ...tr3_4, ...tr4_5, ...tr5_6, ...tr6_7, ...tr7_8,  ...tr8_9, ...tr9_1]

  const imagePromises = images.map((src) => {
    return new Promise<HTMLImageElement>((resolve) => {
      const img = new Image()
      img.src = src
      img.onload = () => resolve(img)
    })
  })

  Promise.all(imagePromises).then((imagesLoaded) => {
    loadedImages = [...(imagesLoaded as HTMLImageElement[])]
    imagesSequenceEmitter.emit("sequence-loaded")
  })
}

const removeLoadingClass = () => {
  document.body.classList.remove("loading");
};

let progress = 1

export const normalize = (value: number, min: number, max: number) => {
  return Math.max(0, Math.min(1, (value - min) / (max - min)))
}

const canvas = document.querySelector("canvas") as HTMLCanvasElement

canvas.width = 720
canvas.height = 720
const ctx = canvas.getContext("2d")

imagesSequenceEmitter.on("sequence-loaded", () => {
  removeLoadingClass();
  requestAnimationFrame(render)
})

loadSequenceImages()

let currentIndex = -1

function render() {
  let index = Math.round(normalize(progress, 1, 10) * (loadedImages.length - 1))

  if (index !== currentIndex) {
    currentIndex = index
    if (!ctx || !canvas) return

    ctx.drawImage(
      loadedImages[index] as HTMLImageElement,
      0,
      0,
      canvas.width,
      canvas.height
    )
  }

  requestAnimationFrame(render)
}

let animation: number | null = null
let startTime: number | null = null
let startValue = 1
let targetValue = 1

const calculateShortestPath = (start: number, end: number): number => {
  // Regular difference
  const directDiff = end - start

  // Circular differences
  const throughTopDiff = end + 9 - start
  const throughBottomDiff = end - (start + 9)

  // Find the smallest absolute difference
  const diffs = [directDiff, throughTopDiff, throughBottomDiff]
  const absDiffs = diffs.map(Math.abs)
  const minDiff = Math.min(...absDiffs)

  return diffs[absDiffs.indexOf(minDiff)]
}

const progressIndicator = document.querySelector(".switcher-progress")

const animate = (timestamp: number): void => {
  if (!startTime) {
    startTime = timestamp
  }

  const elapsed = timestamp - startTime
  const duration = 1000 // 1 second animation

  if (elapsed < duration) {
    const animprogress = elapsed / duration
    // Easing function for smoother animation

    const diff = calculateShortestPath(startValue, targetValue)
    let newValue = startValue + diff * animprogress

    // Handle wrapping
    if (newValue > 9) newValue = newValue - 9
    if (newValue < 1) newValue = newValue + 9

    progress = newValue
    animation = requestAnimationFrame(animate)
  } else {
    // Ensure we land exactly on the target
    progress = targetValue
    animation = null
    startTime = null
  }

  if (!progressIndicator) return

  progressIndicator.textContent = progress.toFixed(2)
}


const onClick = (target: number): void => {
  // Immediately stop current animation
  if (animation) {
    cancelAnimationFrame(animation)
  }

  // 背景过渡
  const current = document.querySelector('.bg-overlay--current') as HTMLElement
  const next = document.querySelector('.bg-overlay--next') as HTMLElement
  
  next.setAttribute('data-state', target.toString())
  next.style.opacity = '1'
  current.style.opacity = '0'
  
  setTimeout(() => {
    current.setAttribute('data-state', target.toString())
    current.style.opacity = '1'
    next.style.opacity = '0'
  }, 1000)

  // Start new animation from current position
  startTime = null
  startValue = progress
  targetValue = target
  animation = requestAnimationFrame(animate)
}

;[...document.querySelectorAll(".switcher button")].forEach((button) => {
  button.addEventListener("click", (e) => {
    const value = parseInt(
      (e.currentTarget as HTMLButtonElement).getAttribute("data-state") as string
    )
    
    // 先把所有 active 去掉
    document.querySelectorAll('.switcher-button-wrapper').forEach(b => b.classList.remove('active'))
    ;(e.currentTarget as HTMLButtonElement).closest('.switcher-button-wrapper')?.classList.add('active')

    const switcher = document.querySelector('.switcher') as HTMLElement
    const track = document.querySelector('.switcher-track') as HTMLElement
    const buttons = [...document.querySelectorAll('.switcher-button-wrapper')]
    const clickedIndex = buttons.indexOf(
      (e.currentTarget as HTMLButtonElement).closest('.switcher-button-wrapper') as HTMLElement
    )

    const normalWidth = 110 + 24
    const trackCenter = track.getBoundingClientRect().width / 2
    const offset = trackCenter - (clickedIndex * normalWidth + 300 / 2)
    switcher.style.transform = `translateX(${offset}px)`

    buttons.forEach((btn, i) => {
      const distance = Math.abs(i - clickedIndex)
      if (distance <= 2) {
        (btn as HTMLElement).style.opacity = '1'
      } else {
        (btn as HTMLElement).style.opacity = '0'
      }
    })

onClick(value)

    onClick(value)
  })
})

const buttons = document.querySelectorAll('.switcher button')
const thirdButton = buttons[2] as HTMLButtonElement
thirdButton?.click()
