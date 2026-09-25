let capacitorHaptics = null

async function loadCapacitorHaptics() {
  if (capacitorHaptics !== null) return capacitorHaptics
  try {
    const mod = await import('@capacitor/haptics')
    capacitorHaptics = mod
    return mod
  } catch {
    capacitorHaptics = false
    return false
  }
}

function vibrate(pattern) {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern)
    }
  } catch {}
}

export function lightHaptic() {
  vibrate(10)
}

export function light() {
  vibrate(10)
}

export function tap() {
  vibrate(10)
}

export function medium() {
  vibrate(20)
}

export function heavy() {
  vibrate(35)
}

export function impact() {
  vibrate(20)
}

export function haptic() {
  vibrate(10)
}

export function success() {
  vibrate([10, 40, 20])
}

export function warning() {
  vibrate([20, 60, 20])
}

export function error() {
  vibrate([30, 50, 30, 50, 30])
}

export default lightHaptic