import { _decorator, Component, Label, Node,tween,Vec3,sp } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl } from '../../Mgr/UIMgr';
import { LevelConfig } from '../../InterFace/LevelConfig';
import { Utils }  from "../../Util/Utils";
import { SoundMgr } from '../../Mgr/SoundMgr';
 
@ccclass('LevelWF_TotalWin_Ctrl')
export class LevelWF_TotalWin_Ctrl extends UICtrl {

    m_levelConfig:LevelConfig = null;
    m_coin:number = 0;

    start() {
        this.view["lb_win"].getComponent(Label).string = "0";
        this.m_coin = 0;
    }

    update(deltaTime: number) {
        
    }

    protected initView(): void {
    
    }

    public initData( levelConfig:LevelConfig ):void{
        this.m_levelConfig = levelConfig;

        // 播放一下动画
        this.node.setScale(0.1,0.1,1);
        tween(this.node)
        .to( 0.3, {scale: new Vec3(1, 1, 1)})
        .start();
    }

    public setWinCount(addCoin:number):void{
        this.m_coin = this.m_coin + addCoin;
        let coin = Utils.util_formatCoins( this.m_coin,9 );
        this.view["lb_win"].getComponent(Label).string = coin;

        // 播放spine
        let spineNode = this.view["skeleton"];
        let spine = spineNode.getComponent(sp.Skeleton) as sp.Skeleton;
        if( spine ){
            spine.setAnimation(0, "Game2-Total Win", false);
        }

        // 播放音效
        let soundFile = this.m_levelConfig.SoundsFile["FlyCollect"];
        if (soundFile){
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
        }
    }
}


