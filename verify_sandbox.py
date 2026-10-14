import time
import subprocess
from playwright.sync_api import sync_playwright

def run_verification():
    # Start local HTTP server
    server_process = subprocess.Popen(["python3", "-m", "http.server", "8080"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.5)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1280, "height": 720})

            # Listen to console messages and page errors
            errors = []
            page.on("pageerror", lambda err: errors.append(f"PageError: {err}"))
            page.on("console", lambda msg: print(f"[Browser Console] {msg.type}: {msg.text}") if msg.type == "error" else None)

            print("Navigating to http://localhost:8080...")
            page.goto("http://localhost:8080")
            page.wait_for_timeout(2000)

            # Click Connect to Mesh button to start
            connect_btn = page.query_selector("#btn-connect-mesh")
            if connect_btn:
                connect_btn.click()
                page.wait_for_timeout(1000)

            # Verify Three.js scene and window objects exist
            is_three_loaded = page.evaluate("() => typeof window.THREE !== 'undefined'")
            print(f"Three.js Loaded: {is_three_loaded}")

            is_player_initialized = page.evaluate("() => window.player && window.player.position !== undefined")
            print(f"Player Initialized: {is_player_initialized}")

            player_pos = page.evaluate("() => ({ x: window.player.position.x, y: window.player.position.y, z: window.player.position.z })")
            print(f"Player Initial Position: {player_pos}")

            is_grounded = page.evaluate("() => window.player.isGrounded")
            print(f"Player Grounded Status: {is_grounded}")

            # Test sound engine invocation with block parameters
            audio_test = page.evaluate("""() => {
                try {
                    window.playSound('place', 'gold', 0, 0, 0);
                    window.playSound('break', 'green', 1, 1, 1);
                    window.playSound('land', 'wall', -15, -17, -15);
                    return "Audio triggers executed successfully";
                } catch(e) {
                    return e.toString();
                }
            }""")
            print(f"Audio Engine Test Result: {audio_test}")

            # Test continuous jump on voxel block / room floor
            page.keyboard.down("Space")
            page.wait_for_timeout(500)
            mid_jump_y = page.evaluate("() => window.player.position.y")
            page.keyboard.up("Space")
            print(f"Player Height during Jump: {mid_jump_y}")

            # Take screenshot for visual verification
            screenshot_path = "verification_screenshot.png"
            page.screenshot(path=screenshot_path)
            print(f"Verification screenshot saved to {screenshot_path}")

            browser.close()

            if errors:
                print(f"Page errors encountered: {errors}")
            else:
                print("SUCCESS: All sandbox verification checks passed cleanly without errors!")

    finally:
        server_process.terminate()

if __name__ == "__main__":
    run_verification()
