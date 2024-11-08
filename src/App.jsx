import React, { useRef, useEffect, useState } from 'react'

    const CANVAS_WIDTH = 800
    const CANVAS_HEIGHT = 600
    const PLAYER_WIDTH = 50
    const PLAYER_HEIGHT = 30
    const ALIEN_WIDTH = 40
    const ALIEN_HEIGHT = 30
    const ALIEN_ROWS = 5
    const ALIEN_COLS = 10

    function App() {
      const canvasRef = useRef(null)
      const [score, setScore] = useState(0)
      const [gameOver, setGameOver] = useState(false)

      useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        
        // Game state
        const player = {
          x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
          y: CANVAS_HEIGHT - PLAYER_HEIGHT - 10,
          speed: 5
        }

        const bullets = []
        const aliens = []

        // Create aliens
        for (let row = 0; row < ALIEN_ROWS; row++) {
          for (let col = 0; col < ALIEN_COLS; col++) {
            aliens.push({
              x: col * (ALIEN_WIDTH + 10) + 50,
              y: row * (ALIEN_HEIGHT + 10) + 50,
              alive: true
            })
          }
        }

        let alienDirection = 1
        let alienMoveDown = false

        // Keyboard controls
        const keys = {}
        window.addEventListener('keydown', (e) => {
          keys[e.code] = true
        })
        window.addEventListener('keyup', (e) => {
          keys[e.code] = false
        })

        // Shoot bullet
        window.addEventListener('keydown', (e) => {
          if (e.code === 'Space' && !gameOver) {
            bullets.push({
              x: player.x + PLAYER_WIDTH / 2,
              y: player.y,
              speed: 7
            })
          }
        })

        // Game loop
        function gameLoop() {
          if (gameOver) return

          // Clear canvas
          ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

          // Player movement
          if (keys['ArrowLeft'] && player.x > 0) {
            player.x -= player.speed
          }
          if (keys['ArrowRight'] && player.x < CANVAS_WIDTH - PLAYER_WIDTH) {
            player.x += player.speed
          }

          // Draw player
          ctx.fillStyle = 'green'
          ctx.fillRect(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT)

          // Move and draw bullets
          for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i]
            bullet.y -= bullet.speed

            // Check bullet-alien collision
            for (let j = aliens.length - 1; j >= 0; j--) {
              const alien = aliens[j]
              if (alien.alive && 
                  bullet.x > alien.x && 
                  bullet.x < alien.x + ALIEN_WIDTH &&
                  bullet.y > alien.y && 
                  bullet.y < alien.y + ALIEN_HEIGHT) {
                alien.alive = false
                bullets.splice(i, 1)
                setScore(prev => prev + 10)
                break
              }
            }

            // Remove bullets out of screen
            if (bullet.y < 0) {
              bullets.splice(i, 1)
            } else {
              ctx.fillStyle = 'white'
              ctx.fillRect(bullet.x, bullet.y, 5, 10)
            }
          }

          // Move and draw aliens
          ctx.fillStyle = 'red'
          let hitEdge = false
          for (const alien of aliens) {
            if (!alien.alive) continue

            alien.x += alienDirection * 2

            // Check alien edge collision
            if (alien.x + ALIEN_WIDTH > CANVAS_WIDTH || alien.x < 0) {
              hitEdge = true
            }

            ctx.fillRect(alien.x, alien.y, ALIEN_WIDTH, ALIEN_HEIGHT)

            // Check alien-player collision
            if (alien.y + ALIEN_HEIGHT > player.y) {
              setGameOver(true)
            }
          }

          // Change alien direction and move down
          if (hitEdge) {
            alienDirection *= -1
            for (const alien of aliens) {
              alien.y += 20
            }
          }

          // Check win condition
          if (aliens.every(alien => !alien.alive)) {
            setGameOver(true)
          }

          requestAnimationFrame(gameLoop)
        }

        gameLoop()
      }, [gameOver])

      const restartGame = () => {
        setGameOver(false)
        setScore(0)
      }

      return (
        <div>
          <canvas 
            ref={canvasRef} 
            width={CANVAS_WIDTH} 
            height={CANVAS_HEIGHT}
          />
          {gameOver && (
            <div style={{
              position: 'absolute', 
              color: 'white', 
              textAlign: 'center', 
              width: '100%'
            }}>
              <h1>Game Over</h1>
              <p>Score: {score}</p>
              <button onClick={restartGame}>Restart</button>
            </div>
          )}
          <div style={{
            position: 'absolute', 
            top: '10px', 
            left: '10px', 
            color: 'white'
          }}>
            Score: {score}
          </div>
        </div>
      )
    }

    export default App
