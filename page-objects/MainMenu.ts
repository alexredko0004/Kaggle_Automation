import { Locator } from '@playwright/test';
import {BasePage} from './BasePage'

export class MainMenu extends BasePage{
    readonly creationMenu: Locator
    readonly datasetsItem: Locator
    readonly homeBtn: Locator
    readonly modelsItem: Locator
    readonly plusBtn: Locator

    constructor(page){
        super(page)
        this.creationMenu = this.page.locator('.mdc-menu[aria-hidden="false"]')
        this.datasetsItem = page.locator('[data-click-log-id="datasets"]')
        this.homeBtn = page.locator('[data-click-log-id="home"]')
        this.modelsItem = page.locator('[data-click-log-id="models"]')
        this.plusBtn = page.locator('button').getByText('Create')
    }
    public async closeCreationMenu(){
        if(await this.creationMenu.isVisible()) {
            await this.page.waitForTimeout(500)
            await this.plusBtn.click();
        }
    }

    public async openHomePage(){
        await this.page.goto('/')
    }

    public async openCreationMenu(){
        await this.plusBtn.click();
    }

    public async openDatasetsPageViaMainMenu(){
       await this.page.reload();
       await this.datasetsItem.click() 
    }

    public async openModelsPageViaMainMenu(){
        await this.modelsItem.waitFor();
        await this.modelsItem.click()
     }
}