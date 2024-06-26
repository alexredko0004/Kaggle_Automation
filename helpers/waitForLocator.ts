import {Locator} from "@playwright/test"

export async function waitForLocator(
    locator: Locator,
    condition: (locator: Locator) => Promise<boolean>,
    timeout: number = 30000,  // default timeout of 30 seconds
    interval: number = 1000   // check every second
  ): Promise<void> {
    const startTime = Date.now();
  
    while (Date.now() - startTime < timeout) {
      if (await condition(locator)) {
        return;
      }
      await new Promise(res => setTimeout(res, interval));
    }
  
    throw new Error(`Timeout of ${timeout} ms exceeded while waiting for condition`);
  }