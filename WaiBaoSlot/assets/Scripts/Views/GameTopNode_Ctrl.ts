import { _decorator, Component, Node,Label,view,Widget,sys, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl,UIMgr } from '../Mgr/UIMgr';
import { PlayerMgr } from '../Mgr/PlayerMgr';
import { Utils } from '../Util/Utils';
import { GlEventMgr } from '../Mgr/GlEventMgr';
import { EventName } from '../Mgr/EventName';
import { LevelMgr } from '../Mgr/LevelMgr';
import { GameManager } from '../Mgr/GameManager';

@ccclass('GameTopNode_Ctrl')
export class GameTopNode_Ctrl extends UICtrl {
    
    protected initView(): void {
        // -- 显示获得的金币
        GlEventMgr.Instance.on(EventName.ShowAmount, this.addCoin, this);
        // -- 刷新金币 RefreshTopCoinUI
        GlEventMgr.Instance.on(EventName.RefreshTopCoinUI, this.setCoinUI, this);

        this.addButtonClick("btnHome", this, ()=> this.changeBackToLobby());
    }
    start() {
        this.setCoinUI();
    }

    update(deltaTime: number) {
        
    }

    onLoad(): void {
        super.onLoad();
        // const w = this.getComponent(Widget)!;
        // if (!w) {
        //     return;
        // }
        // const safe = sys.getSafeAreaRect();
        // const designH = 1370;
        // // 顶部偏移刘海
        // w.top = designH - (safe.y + safe.height);
        // // 底部偏移虚拟条
        // w.bottom = safe.y;
        // w.updateAlignment();

        // const uiRoot = this.node; // 所有页面的父节点
        // const visibleSize = view.getVisibleSize();
        // const designW = 768;
        // // 计算当前实际可见设计宽度
        // const scaleX = visibleSize.width / designW;
        // uiRoot.scale.set(scaleX, scaleX, 1);

        // // 设置位置
        // let posY = (visibleSize.height - 1370) / 2
        // uiRoot.setPosition(new Vec3(0,posY,0));
    }

    private setCoinUI(): void {
        const coin = PlayerMgr.Instance.getCoin();
        const coinLabel = this.view["lb_coin"].getComponent(Label);
        if (coinLabel) {
            coinLabel.string = Utils.util_formatCoins(coin,6);
        }
    }

    private addCoin(scaleAction:boolean):void {
        let winAmount = LevelMgr.Instance.getLevelModel().getWinAmount();
        if(winAmount > 0){
            PlayerMgr.Instance.addCoin( winAmount );
            this.setCoinUI();
        }
    }

    public changeBackToLobby(){
        GameManager.instance.changeToLobbyScene()
    }
}

