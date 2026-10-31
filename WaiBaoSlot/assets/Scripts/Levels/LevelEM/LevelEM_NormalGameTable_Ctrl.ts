import { _decorator, Component, Node,instantiate,Prefab,Vec3, tween, sp } from 'cc';
const { ccclass, property } = _decorator;

import { ResMgr } from '../../Mgr/ResMgr';
import { BaseGameTable } from '../../GameBase/BaseGameTable';
import { LevelEM_Jackpot_Ctrl } from './LevelEM_Jackpot_Ctrl';
import { LevelEM_Wheel_Ctrl } from './LevelEM_Wheel_Ctrl';
import { Utils } from '../../Util/Utils';
import { SoundMgr } from '../../Mgr/SoundMgr';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { LevelEM_GameModel } from './LevelEM_GameModel';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';
import { ActionType } from '../../InterFace/LevelConfig';
import { LevelEM_NormalReelTable_Ctrl } from './LevelEM_NormalReelTable_Ctrl';

@ccclass('LevelEM_NormalGameTable_Ctrl')
export class LevelEM_NormalGameTable_Ctrl extends BaseGameTable {

    private m_WheelCtrl:LevelEM_Wheel_Ctrl = null; 

    protected initView(): void {
        super.initView();
    }

    start() {
        super.start();
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }

    public createOtherUI():void{
        // JackpotTitle
        let prefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/JackpotTitle",Prefab);
        if(prefab){
            let jackpot = instantiate(prefab);
            this.view["NodeJackPot"].addChild(jackpot);
            const compent:LevelEM_Jackpot_Ctrl = jackpot.addComponent( LevelEM_Jackpot_Ctrl ) as LevelEM_Jackpot_Ctrl;
            // 初始化组件
            compent.initUI( this.m_levelConfig );
        }
        // wheel
        let wheelPrefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/Wheel",Prefab);
        if(wheelPrefab){
            let wheel = instantiate(wheelPrefab);
            this.view["NodeWheel"].addChild(wheel);
            const compent:LevelEM_Wheel_Ctrl = wheel.addComponent( LevelEM_Wheel_Ctrl ) as LevelEM_Wheel_Ctrl;
            // 初始化组件
            compent.initUI( this.m_levelConfig );
            // 保存组件
            this.m_WheelCtrl = compent;
        }
    }

    public initLogicFunc() {
        this.m_ListFunc.push( this.slotLineAction.bind(this) ); // -- 显示连线
        this.m_ListFunc.push( this.collectAction.bind(this) ); // -- 显示收集动画
        this.m_ListFunc.push( this.showAmountWin.bind(this) );  // -- 显示赢钱和大赢
        this.m_ListFunc.push( this.enterOtherGame.bind(this) );     // -- 触发 respin
    }

    // 显示连线
    public slotLineAction() {
        this.playGameTableLineAction();

        this.excuteListFunc();

        // 触发抽奖，转到第5格
        // this.m_WheelCtrl.spinTo(5);
    }

    // 播放收集动画
    public collectAction() {
        let collectAction:any = (LevelMgr.Instance.getLevelModel() as LevelEM_GameModel).getCollectAction();
        let leftCollect:any = collectAction.left;
        let rightCollect:any = collectAction.right;
        let hasBirdCollect = false;
        for (let i = 0; i < leftCollect.length; i++) {
            let collectData = leftCollect[i];
            this.bianPaoFlyAction(collectData.col,collectData.row,1);
            hasBirdCollect = true;
        }
        for (let i = 0; i < rightCollect.length; i++) {
            let collectData = rightCollect[i];
            this.bianPaoFlyAction(collectData.col,collectData.row,2);
            hasBirdCollect = true;
        }
        if(hasBirdCollect){
            Utils.performWithDelay(this.node,()=>{
                this.excuteListFunc();
            },1.5);
        }
        else{
            this.excuteListFunc();
        }
    }

    public bianPaoFlyAction( col:number,row:number,type:number ){
        let coinPrefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/CoinFly",Prefab);
        if(coinPrefab){
            let coinNode = instantiate(coinPrefab);
            this.view["NodeReelTable0"].addChild(coinNode);

            // 起始位置
            let worldPos = this.getSymbolWorldPos( 0,col,row );
            let localPos = new Vec3();
            // 将世界坐标转化为局部坐标
            this.view["NodeReelTable0"].inverseTransformPoint(localPos,worldPos);
            coinNode.position = localPos;
            coinNode.scale = new Vec3(0.3,0.3,1);
            let time = 1;

            let endWorldPos = null;
            if(type == 1){
                endWorldPos = this.m_WheelCtrl.view["Node1"].worldPosition.clone();
            } else if(type == 2){
                endWorldPos = this.m_WheelCtrl.view["Node2"].worldPosition.clone();
            }

            // 飞行的音效
            let soundFile = this.m_levelConfig.SoundsFile["CoinFly"];
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
            
            tween(coinNode)
            .parallel(
                Utils.jumpTo(coinNode, time, endWorldPos, 300),
                tween(coinNode).to(time, { scale: new Vec3(0.7, 0.7, 1) }),
                tween(coinNode).to(time, { angle: 720 })
            )
            .delay(0.1)
            .call(() => {
                coinNode.destroy();
                // 播放spine
                this.m_WheelCtrl.playBirdCollectAction(type);
                // 播放音效
                let soundFile = this.m_levelConfig.SoundsFile["BirdJiao"];
                SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
            })
            .start();
        }
    } 

    // 显示赢钱和大赢
    public showAmountWin() {
        this.excuteListFunc();
    }

    // 触发respin
    public enterOtherGame() {
        let action = LevelMgr.Instance.getLevelModel().getAction();
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
        if (nextAction == ActionType.RESPIN){
            // 播放音效
            let soundFile1 = this.m_levelConfig.SoundsFile["BirdStartReSpin"];
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile1 );
            // 延迟2秒后触发respin
            Utils.performWithDelay(this.node,()=>{
                let respinInfo = LevelMgr.Instance.getLevelModel().getReSpin();
                if (respinInfo.birdTrigger != null && respinInfo.birdTrigger.length > 0){
                    // 小鸟的收集 触发respin
                    // 播放小鸟回位动画
                    this.m_WheelCtrl.resetBirdNodePosAction();
                    // 播放音效
                    let soundFile = this.m_levelConfig.SoundsFile["BirdJiao"];
                    SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );

                    Utils.performWithDelay(this.node,()=>{
                        // 播放轮盘上的信号块变化
                        (this.getReelTableCompent(0) as LevelEM_NormalReelTable_Ctrl).playChangeBonusAction();
                        // 播放音效
                        let soundFile3 = this.m_levelConfig.SoundsFile["GuangBao"];
                        SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile3 );
                    },2)

                    // 播放进入音效
                    Utils.performWithDelay(this.node,()=>{
                        // 播放音效
                        let soundFile3 = this.m_levelConfig.SoundsFile["BirdReSpinEnter"];
                        SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile3 );
                    },3)

                    // 播放老头的动画 然后进入respin
                    Utils.performWithDelay(this.node,()=>{
                        this.addLaoTouAction();
                    },5)
                }
            },2)
        }
        else {
            // 恢复点击
            GlEventMgr.Instance.emit( EventName.RecoverSpinBtn )
        }
    }

    public addLaoTouAction():void{
        // 播放音效
        let soundFile3 = this.m_levelConfig.SoundsFile["LaoTouReSpinEnter"];
        SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile3 );
        // 延后1秒 跟音效对齐
        Utils.performWithDelay(this.node,()=>{
            let laoTouPrefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/LaoTouEnter",Prefab);
            if(laoTouPrefab){
                let laoTouNode = instantiate(laoTouPrefab);
                this.view["NodeLaoTou"].addChild(laoTouNode);
                // -- 播放spine动画
                let spineNode = laoTouNode.getChildByName("skeleton")
                let spine = spineNode.getComponent(sp.Skeleton) as sp.Skeleton;
                if (spine) {
                    spine.setAnimation(0, "Game3-oldman", false);
                    spine.setCompleteListener((entry: sp.spine.TrackEntry) => {
                        spine.setCompleteListener(null);
                        laoTouNode.destroy();

                        // 触发respin
                        this.m_gameMainCompent.enterReSpin();
                    });
                }
            }
        },1)
    }
}




