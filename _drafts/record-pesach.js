async (page) => {
    // Set viewport to match video dimensions
    await page.setViewportSize({ width: 1280, height: 720 });

    // Start recording
    await page.video();

    // Navigate to the greeting page
    await page.goto('http://127.0.0.1:8767/pesach-video-greeting.html', { waitUntil: 'load' });

    // Wait for full animation (12 seconds scroll + buffer)
    await page.waitForTimeout(14000);

    return 'Recording complete';
}
