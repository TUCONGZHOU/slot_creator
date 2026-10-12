import { _decorator, Component, instantiate, Node, Prefab,sp,Vec3,tween } from 'cc';
const { ccclass, property } = _decorator;


import { BaseGameTable } from '../../GameBase/BaseGameTable';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';
import { ResMgr } from '../../Mgr/ResMgr';

import { LevelMgr } from '../../Mgr/LevelMgr';
import { ActionType,StoredIconStruct } from '../../InterFace/LevelConfig';
import { UICtrl, UILayer, UIMgr } from '../../Mgr/UIMgr';

import { Utils } from '../../Util/Utils';
import { SoundMgr } from '../../Mgr/SoundMgr';

import { LevelWF_YuanBaoSpine_Ctrl } from './LevelWF_YuanBaoSpine_Ctrl';
import { LevelWF_Jackpot_Ctrl } from './LevelWF_Jackpot_Ctrl';
import { LevelWF_ReSpinReelTable_Ctrl } from "./LevelWF_ReSpinReelTable_Ctrl"
import { LevelWF_TotalWin_Ctrl } from "./LevelWF_TotalWin_Ctrl";


type FlyBonusMeta = {
    col: number;
    row: number;
    coin: number;
    id:number;
}

@ccclass('LevelWF_ReSpinGameTable_Ctrl')
export class LevelWF_ReSpinGameTable_Ctrl extends BaseGameTable {

    private m_yuanbaoCtrl:LevelWF_YuanBaoSpine_Ctrl = null;
    public m_totalWinCtrl:LevelWF_TotalWin_Ctrl = null;

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
        let prefab2 = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/YuanBaoSpine",Prefab);
        if(prefab2){
            let jackpot = instantiate(prefab2);
            this.view["SpNode"].addChild(jackpot);
            const compent:LevelWF_YuanBaoSpine_Ctrl = jackpot.addComponent( LevelWF_YuanBaoSpine_Ctrl ) as LevelWF_YuanBaoSpine_Ctrl;
            // 初始化组件
            compent.initUI( this.m_levelConfig );
            this.m_yuanbaoCtrl = compent;
        }

        let prefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/JockpotTitle",Prefab);
        if(prefab){
            let jackpot = instantiate(prefab);
            this.view["NodeJackPot"].addChild(jackpot);
            const compent:LevelWF_Jackpot_Ctrl = jackpot.addComponent( LevelWF_Jackpot_Ctrl ) as LevelWF_Jackpot_Ctrl;
            // 初始化组件
            compent.initUI( this.m_levelConfig );
        }
    }

    public initLogicFunc():void {
        this.m_ListFunc.push( this.fengHuangFly.bind(this) );
        this.m_ListFunc.push( this.showAmountWin.bind(this) );  // -- 结算 显示赢钱和大赢 (第一个轮盘的)
        this.m_ListFunc.push( this.showBigWin.bind(this) );     // -- 显示大赢动画 (第一个轮盘的)
        this.m_ListFunc.push( this.enterOtherGame.bind(this) );     // -- 触发normal
    }

    // 凤凰飞行
    public fengHuangFly():void {
        // 设置次数
        (this.getReelTableCompent(0) as LevelWF_ReSpinReelTable_Ctrl).setReSpinNumUI();

        let action = LevelMgr.Instance.getLevelModel().getAction();
        let respinInfo = LevelMgr.Instance.getLevelModel().getReSpin();
        let curRewardSignals = respinInfo.curRewardSignals;
        if( curRewardSignals.list != null && curRewardSignals.list.length > 0 ){
            let prefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/FengHuangFly",Prefab);
            if(prefab){
                let flyNode = instantiate(prefab);
                this.view["FengHuangNode"].addChild(flyNode);

                // 播放spine动画
                let spineNode = flyNode.getChildByName("skeleton")
                let spine = spineNode.getComponent(sp.Skeleton) as sp.Skeleton;
                if (spine) {
                    spine.setCompleteListener((entry: sp.spine.TrackEntry) => {
                        spine.setCompleteListener(null); // 清除监听器
                        // bonusId 数字滚动
                        this.playBonusNumAction(curRewardSignals.list);
                    });
                    spine.setAnimation(0, "Game2-fenghuang", false);
                }

                Utils.performWithDelay(this.node,()=>{
                    flyNode.destroy();
                    this.excuteListFunc();
                },3)
            }
        }else{
            this.excuteListFunc();
        }
    }


    public showAmountWin():void{
        // 针对respin 这个方法播放收集动画
        let action = LevelMgr.Instance.getLevelModel().getAction();
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
        if (action == ActionType.RESPIN && nextAction == ActionType.NORMAL) {
            // 显示当前加倍的动画
            Utils.performWithDelay(this.node,()=>{
                (this.getReelTableCompent(0) as LevelWF_ReSpinReelTable_Ctrl).showJieSuanRespinBetTips(()=>{
                    // 整个轮盘的bonus加倍动画
                    (this.getReelTableCompent(0) as LevelWF_ReSpinReelTable_Ctrl).playBonusNumGrowUpByRespinOver();
                    // 开始飞行动画
                    Utils.performWithDelay( this.node,()=>{
                        // 计算要飞行的数据
                        (this.getReelTableCompent(0) as LevelWF_ReSpinReelTable_Ctrl).initDlyBonusActionData();
                        // 显示total win
                        this.addTotalWinTips();
                        // 开始飞行
                        Utils.performWithDelay(this.node,()=>{
                            (this.getReelTableCompent(0) as LevelWF_ReSpinReelTable_Ctrl).flyBonusAction();
                        },2)
                    },2)
                });
            },1)
        }else{
            this.excuteListFunc();
        }
    }

    public addTotalWinTips():void{
        let prefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/TotalWin",Prefab);
        if(prefab){
            let tipsNode = instantiate(prefab);
            this.view["TotalWinNode"].addChild(tipsNode);
            const compent:LevelWF_TotalWin_Ctrl = tipsNode.addComponent( LevelWF_TotalWin_Ctrl ) as LevelWF_TotalWin_Ctrl;
            compent.initData(this.m_levelConfig);
            this.m_totalWinCtrl = compent;
        }
    }

    public getTotalWinNode():Node{
        let node = this.view["TotalWinNode"];
        return node;
    }

    //  显示大赢
    public showBigWin():void{
        let action = LevelMgr.Instance.getLevelModel().getAction();
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
        if (action == ActionType.RESPIN && nextAction == ActionType.NORMAL) {
            const winNum = LevelMgr.Instance.getLevelModel().getWinAmount();
            const bet = LevelMgr.Instance.getLevelModel().getBet();
            let multiple = winNum / bet;
            if (multiple >= 20){
                let prefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/BigWin",Prefab);
                if( prefab ){
                    let bigWinNode = instantiate(prefab);
                    this.view["NodeReelTable0"].addChild(bigWinNode);
                    // 播放音效
                    let soundFile = "Sounds/bigWin";
                    if (soundFile){
                        SoundMgr.Instance.playSound( "GameMain",soundFile );
                    }
                    Utils.performWithDelay( this.node,()=>{
                        bigWinNode.destroy();
                        // 下一步
                        this.excuteListFunc();
                    },3)
                }
            }
            else{
                this.excuteListFunc();
            }
        }
        else{
            this.excuteListFunc();
        }
    }

    public enterOtherGame():void {
        let action = LevelMgr.Instance.getLevelModel().getAction();
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
        if (nextAction == ActionType.NORMAL){
            // 进入Normal
            this.m_gameMainCompent.enterNormal();
        }
        else {
            // 恢复点击
            GlEventMgr.Instance.emit( EventName.RecoverSpinBtn )
        }
    }

    // bonus的信号块播放数字动画
    public playBonusNumAction( list:StoredIconStruct[] ):void{
        (this.getReelTableCompent(0) as LevelWF_ReSpinReelTable_Ctrl).playBonusNumAction(list);
    }
}


