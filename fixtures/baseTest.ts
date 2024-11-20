import {test as base, expect, Page} from '@playwright/test'
import { MainMenu } from '../page-objects/MainMenu'

export type BaseTest = {
   page: Page,
   mainMenu: MainMenu
}

export const test = base.extend<BaseTest>({
   page: async ({page},use,testInfo)=>{
       console.log(`${testInfo.title} started at ${Date.now().toLocaleString()}`)
       await use(page)
       if (testInfo.status==='passed'){
        console.log(`Total duration: ${testInfo.duration}`)
       } else {
        console.log(`${testInfo.title} finished at ${Date.now().toLocaleString()}`)
    }
   },
   mainMenu: async ({page},use)=>{
    const mainMenu = new MainMenu(page);
    await use(mainMenu)
   }
})

export {expect} from '@playwright/test'