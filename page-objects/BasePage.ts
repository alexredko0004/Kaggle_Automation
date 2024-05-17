import {Page, Locator} from '@playwright/test'

export class BasePage{
    page: Page

    constructor(page){
        this.page = page
    }
}