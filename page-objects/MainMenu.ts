import { Locator,expect } from '@playwright/test';
import {BasePage} from './BasePage'

export class MainMenu extends BasePage{
    readonly homeBtn: Locator
    readonly plusBtn: Locator
    readonly datasetsItem: Locator
    readonly modelsItem: Locator

    constructor(page){
        super(page)
        this.homeBtn = page.locator('[data-click-log-id="home"]')
        this.plusBtn = page.locator('.mdc-menu-surface--anchor button[data-menutarget="true"]')
        this.modelsItem = page.locator('[data-click-log-id="models"]')
        this.datasetsItem = page.locator('[data-click-log-id="datasets"]')
    }

    public async openHomePage(){
        await this.page.goto('/');
    }

    public async openCreationMenu(){
        await this.plusBtn.click();
        await expect(this.page.locator('.mdc-menu[aria-hidden="false"]')).toBeVisible()
    }

    public async closeCreationMenu(){
        if(await this.page.locator('.mdc-menu[aria-hidden="false"]').isVisible()) {
            await this.page.waitForTimeout(500)
            await this.plusBtn.click();
        }
        await expect(this.page.locator('.mdc-menu[aria-hidden="false"]')).toBeHidden()
    }

    public async openDatasetsPage(){
       await this.datasetsItem.click();
       expect(this.page).toHaveURL('/datasets')
    }

    public async openModelsPage(){
        await this.modelsItem.click();
        expect(this.page).toHaveURL('/models')
     }
}