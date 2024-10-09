import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto(`/`);
});

test('Verify that images on home page correspond to screenshots', async ({ page }) => {

  await test.step('Verify that Home page blocks images correspond to screenshots',async()=>{
    const learnToCompeteBlockImage = page.locator(`div[style='background-image: url("/static/images/community/homepage/onboarding/track-card-bg1.svg");']`);
    const takeAShortCourseBlockImage = page.locator(`div[style='background-image: url("/static/images/community/homepage/onboarding/track-card-bg2.svg");']`);
    const browseInspiringDataBlockImage = page.locator(`div[style='background-image: url("/static/images/community/homepage/onboarding/track-card-bg3.svg");']`);
    expect(await learnToCompeteBlockImage.screenshot()).toMatchSnapshot();
    expect(await takeAShortCourseBlockImage.screenshot()).toMatchSnapshot();
    expect(await browseInspiringDataBlockImage.screenshot()).toMatchSnapshot()
  })
  await test.step('Verify that main menu icons correspond to screenshots',async()=>{
    await page.getByText('OK, Got it.').click();
    const homeItemIcon = page.locator("span[title='Home']");
    const competitionsIcon = page.locator("span[title='Competitions']");
    const datasetsIcon = page.locator("span[title='Datasets']");
    const modelsIcon = page.locator("span[title='Models']");
    const codeIcon = page.locator("span[title='Code']");
    const discussionsIcon = page.locator("span[title='Discussions']");
    const learnIcon = page.locator("span[title='Learn']");
    const yourWorkIcon = page.locator("span[title='Your Work']")
    const viewActiveEventsIcon = page.getByLabel('Open Active Events dialog');
    expect(await homeItemIcon.screenshot()).toMatchSnapshot();
    expect(await competitionsIcon.screenshot()).toMatchSnapshot();
    expect(await datasetsIcon.screenshot()).toMatchSnapshot()
    expect(await modelsIcon.screenshot()).toMatchSnapshot();
    expect(await codeIcon.screenshot()).toMatchSnapshot();
    expect(await discussionsIcon.screenshot()).toMatchSnapshot()
    expect(await learnIcon.screenshot()).toMatchSnapshot();
    expect(await yourWorkIcon.screenshot()).toMatchSnapshot();
    expect(await viewActiveEventsIcon.screenshot()).toMatchSnapshot()
  })
  
});
