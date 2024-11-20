import {test as base, expect, Page} from '@playwright/test'
import { MainMenu } from '../page-objects/MainMenu'
import { Datasets } from '../page-objects/DatasetsPage'

export type BaseTest = {
   datasetsPage: Datasets
   mainMenu: MainMenu
}

export const test = base.extend<BaseTest>({
   datasetsPage: async ({page},use)=>{
      const datsetsPage = new Datasets(page);
      await use(datsetsPage)
   },
   mainMenu: async ({page},use)=>{
    const mainMenu = new MainMenu(page);
    await use(mainMenu)
   }
})

export {expect} from '@playwright/test'