import { Locator,expect } from '@playwright/test';
import {BasePage} from './BasePage'

export class MainMenu extends BasePage{
    readonly homeBtn: Locator
    readonly plusBtn: Locator
    readonly datasetsItem: Locator

    constructor(page){
        super(page)
        this.homeBtn = page.locator('[data-click-log-id="home"]')
        this.plusBtn = page.locator('.mdc-menu-surface--anchor button[data-menutarget="true"]')
        // this.datasetsItem = page.locator('[data-click-log-id="datasets"]')
        this.datasetsItem = page.locator('ul[role="list"][class="km-list"] li').getByTitle('Datasets')
    }

    async openHomePage(){
        await this.page.goto('/');
    }

    async openCreationMenu(){
        await this.plusBtn.click();
        await expect(this.page.locator('.mdc-menu[aria-hidden="false"]')).toBeVisible()
    }

    async closeCreationMenu(){
        if(await this.page.locator('.mdc-menu[aria-hidden="false"]').isVisible()) {
            await this.page.waitForTimeout(500)
            await this.plusBtn.click();
        }
        await expect(this.page.locator('.mdc-menu[aria-hidden="false"]')).toBeHidden()
    }

    async openDatasetsPage(){
       await this.datasetsItem.click();
       expect(this.page).toHaveURL('/datasets')
    }
}