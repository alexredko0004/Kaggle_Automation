import {test as base, expect, Page} from '@playwright/test'
import { MainMenu } from '../page-objects/MainMenu'
import { Datasets } from '../page-objects/DatasetsPage'
import { Collections } from '../page-objects/Collections'

export type BaseTest = {
   datasetsPage: Datasets
   collections: Collections
   mainMenu: MainMenu
}

export const test = base.extend<BaseTest>({
   datasetsPage: async ({page},use)=>{
      const datsetsPage = new Datasets(page);
      await use(datsetsPage)
   },
   collections: async ({page},use)=>{
      const collections = new Collections(page);
      await use(collections)
   },
   mainMenu: async ({page},use)=>{
    const mainMenu = new MainMenu(page);
    await use(mainMenu)
   }
})

export {expect} from '@playwright/test'