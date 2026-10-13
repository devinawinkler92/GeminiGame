const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({
        headless: true,
        args: ['--use-gl=angle', '--use-angle=gl-egl', '--ignore-gpu-blocklist']
    });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    await page.goto('http://localhost:8000/index.html');
    await page.waitForTimeout(1000);

    // Initial check
    let stateBefore = await page.evaluate(() => {
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(player.bodyQuaternion);
        return {
            up: [up.x, up.y, up.z],
            isLeaping: player.isLeaping,
            energy: player.energy
        };
    });
    console.log('State before ceiling flip:', stateBefore);

    // Trigger Ceiling Leap: Shift down, then double Space
    await page.keyboard.down('ShiftLeft');
    await page.keyboard.press('Space');
    await page.waitForTimeout(50);
    await page.keyboard.press('Space');
    await page.keyboard.up('ShiftLeft');

    await page.waitForTimeout(100);

    let stateDuring = await page.evaluate(() => {
        return {
            isLeaping: player.isLeaping,
            energy: player.energy
        };
    });
    console.log('State during leap:', stateDuring);

    // Wait for slerp completion (~350ms)
    await page.waitForTimeout(500);

    let stateAfter = await page.evaluate(() => {
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(player.bodyQuaternion);
        return {
            up: [up.x, up.y, up.z],
            isLeaping: player.isLeaping,
            energy: player.energy,
            position: [player.position.x, player.position.y, player.position.z]
        };
    });
    console.log('State after ceiling flip:', stateAfter);

    await page.screenshot({ path: 'ceiling_flip_verified.png' });
    await browser.close();
})();
