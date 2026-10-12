import { _decorator, Component, Node,Button } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl, UIMgr } from '../Mgr/UIMgr';
import { PlayerMgr } from '../Mgr/PlayerMgr';

@ccclass('GetCoin_Ctrl')
export class GetCoin_Ctrl extends UICtrl {
    start() {

    }

    update(deltaTime: number) {
        
    }

    protected initView(): void {
        // 添加按钮监听
        this.addButtonClick("btn_close", this, this.closeUI);
        this.addButtonClick("btn_collect", this, this.collectCoin);
    }

    public collectCoin(button: Button): void {
        // 100000
        PlayerMgr.Instance.addCoin(100000);
        // 关闭界面
        UIMgr.Instance.closeUi("GetCoin");
    }

    public closeUI(button: Button): void {
        // 关闭界面
        UIMgr.Instance.closeUi("GetCoin");
    }
}


