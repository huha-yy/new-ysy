import { useState, useEffect, useRef } from 'react'
import './CountUp.css'

function CountUp({ 
  end, 
  duration = 2000, 
  suffix = '', 
  prefix = '',
  decimals = 0 
}) {
  const [count, setCount] = useState(0)
  const countRef = useRef(0)
  const requestRef = useRef(false)
  const startTimeRef = useRef(0)

  useEffect(() => {
    // 防止重复触发
    if (requestRef.current) return
    requestRef.current = true

    const animateCount = () => {
      const startTime = Date.now()
      startTimeRef.current = startTime
      
      const step = () => {
        const now = Date.now()
        const progress = Math.min((now - startTime) / duration, 1)
        
        // 使用缓动函数让动画更流畅
        const easeOutQuad = 1 - Math.pow(1 - progress, 2)
        countRef.current = end * easeOutQuad
        
        setCount(countRef.current)
        
        if (progress < 1) {
          requestAnimationFrame(step)
        } else {
          setCount(end)
          requestRef.current = false
        }
      }
      
      requestAnimationFrame(step)
    }
    
    animateCount()
    
    return () => {
      requestRef.current = false
    }
  }, [end, duration])

  // 格式化数字
  const formatNumber = (num) => {
    if (decimals > 0) {
      return num.toFixed(decimals)
    }
    return Math.floor(num)
  }

  return (
    <span className="count-up">
      {prefix}
      {formatNumber(count)}
      {suffix}
    </span>
  )
}

export default CountUp

