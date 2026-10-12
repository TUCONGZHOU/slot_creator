import { _decorator, Component, Node,instantiate, Prefab, tween, sp, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

import { BaseGameTable } from '../../GameBase/BaseGameTable';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';
import { ResMgr } from '../../Mgr/ResMgr';
import { LevelCK_Jackpot_Ctrl } from './LevelCK_Jackpot_Ctrl';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { ActionType } from '../../InterFace/LevelConfig';
import { UICtrl, UILayer, UIMgr } from '../../Mgr/UIMgr';
import { LevelCK_ReSpinNum_Ctrl } from './LevelCK_ReSpinNum_Ctrl';
import { LevelCK_ReSpinWinNum_Ctrl } from './LevelCK_ReSpinWinNum_Ctrl';
import { BigWin_P_Ctrl } from '../../Views/BigWin_P_Ctrl';
import { Utils } from '../../Util/Utils';
import { SoundMgr } from '../../Mgr/SoundMgr';
import { LevelCK_FreeSpinOver_Ctrl } from './LevelCK_FreeSpinOver_Ctrl';

@ccclass('LevelCK_ReSpinGameTable_Ctrl')
export class LevelCK_ReSpinGameTable_Ctrl extends BaseGameTable {

    public m_respinNumCtrl:LevelCK_ReSpinNum_Ctrl = null;
    public m_reSpinNumNode:Node = null;
    public m_reSpinWinNumCtrl:LevelCK_ReSpinWinNum_Ctrl = null;

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
        let prefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/JockpotTitle",Prefab);
        if(prefab){
            let jackpot = instantiate(prefab);
            this.view["NodeJackPot"].addChild(jackpot);
            const compent:LevelCK_Jackpot_Ctrl = jackpot.addComponent( LevelCK_Jackpot_Ctrl ) as LevelCK_Jackpot_Ctrl;
            // 初始化组件
            compent.initUI( this.m_levelConfig );
        }

        let prefab1 = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/ReSpinNum",Prefab);
        if(prefab1){
            let reSpinNum = instantiate(prefab1);
            this.view["NodeReNum"].addChild(reSpinNum);
            const compent:LevelCK_ReSpinNum_Ctrl = reSpinNum.addComponent( LevelCK_ReSpinNum_Ctrl ) as LevelCK_ReSpinNum_Ctrl;
            // 初始化组件
            compent.initUI( this.m_levelConfig );
            this.m_respinNumCtrl = compent;
            this.m_reSpinNumNode = reSpinNum;
        }else {
            console.error("====== > 没有找到预制资源：",this.m_abName,"Prefabs/ReSpinNum");
        }
    }

    public startRoll():void{
        super.startRoll();
        this.m_respinNumCtrl.startRollSetNumScale();
    }

    public initLogicFunc() {
        this.m_ListFunc.push( this.slotLineAction.bind(this) ); // -- 显示连线
        this.m_ListFunc.push( this.showAmountWin.bind(this) );  // -- 显示赢钱和大赢
        this.m_ListFunc.push( this.showBigWin.bind(this) );     // -- 显示大赢
        this.m_ListFunc.push( this.enterOtherGame.bind(this) );     // -- 触发normal
    }

    // 显示连线
    public slotLineAction() {
        // 显示ReSpin次数
        this.m_respinNumCtrl.showReSpinNum();

        this.excuteListFunc();
    }

    // 显示赢钱和大赢
    public showAmountWin() {
        // 针对respin 这个方法播放收集动画
        let action = LevelMgr.Instance.getLevelModel().getAction();
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
        if (action == ActionType.RESPIN && nextAction == ActionType.NORMAL) {
            // 添加 节点
            let prefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/ReSpinWinNum",Prefab);
            if(prefab){
                let winNode = instantiate(prefab);
                this.view["NodeReWinNode"].addChild(winNode);
                const compent:LevelCK_ReSpinWinNum_Ctrl = winNode.addComponent( LevelCK_ReSpinWinNum_Ctrl ) as LevelCK_ReSpinWinNum_Ctrl;
                // 初始化组件
                compent.initUI( this.m_levelConfig );
                this.m_reSpinWinNumCtrl = compent;
            }
            // 移除显示respin次数的节点
            this.m_reSpinNumNode.destroy();

            // 执行动画
            const anims: Array<ReturnType<typeof tween>> = [];
            let storeIcons = LevelMgr.Instance.getLevelModel().getStoredIcons();
            let storeData = storeIcons[0];
            for( const value of storeData ){
                let pos:Vec3 = this.getSymbolWorldPos( 0,value.col,value.row );
                anims.push(
                    tween(this.node).delay(0.5)
                );
                anims.push(
                    tween(this.node).call(()=>{
                        this.liZiFlyAction(pos,value.Multiple);
                    })
                );
            }
            anims.push(
                tween(this.node).delay(1)
            );
            anims.push(
                tween(this.node).call(()=>{
                    this.excuteListFunc();
                })
            );
            tween(this.node).sequence(...anims).start();
        }
        else {
            this.excuteListFunc();
        }
    }

    public liZiFlyAction( startWorldPos:Vec3,multiple:number ){
        // 播放音效
        let soundFile = this.m_levelConfig.SoundsFile["LiziFly"];
        if (soundFile){
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
        }
        // 目标点位置
        let destPos:Vec3 = this.view["NodeReWinNode"].position;
        let startPos = new Vec3();
        this.node.inverseTransformPoint(startPos,startWorldPos);
        let prefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/TuoWeiLiZi",Prefab);
        if(prefab){
            let liziNode = instantiate(prefab);
            this.node.addChild( liziNode );
            liziNode.position = startPos;
            tween(liziNode)
                .to(1,{ position:destPos })
                .call(()=>{
                    this.m_reSpinWinNumCtrl.setWinNum( multiple );
                    liziNode.destroy()
                })
                .start()
        }
    }

    // 显示大赢
    public showBigWin() {
        // 针对respin 显示赢钱的面板
        this.showReSpinOverLayer();
    }

    public showReSpinOverLayer() {
        let action = LevelMgr.Instance.getLevelModel().getAction();
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
        if (action == ActionType.RESPIN && nextAction == ActionType.NORMAL) {
            // 显示freespin结束的界面
            const anims: Array<ReturnType<typeof tween>> = [];
            let freeSpinCtrl:LevelCK_FreeSpinOver_Ctrl = null;
            anims.push(
                tween(this.node).delay(0.5)
            );
            anims.push(
                tween(this.node).call(()=>{
                    // -- 音效
                    let winCount = LevelMgr.Instance.getLevelModel().getWinAmount();
                    let soundFile = this.m_levelConfig.SoundsFile["Congrats"];
                    if (soundFile && winCount > 0){
                        SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
                    }
                    // 显示freespin界面
                    freeSpinCtrl = UIMgr.Instance.showUi("LevelCK","Prefabs/FreeSpinOver","LevelCK_FreeSpinOver_Ctrl",UILayer.Normal) as LevelCK_FreeSpinOver_Ctrl;
                    freeSpinCtrl.initUI();
                })
            );
            anims.push(
                tween(this.node).delay(2)
            );
            anims.push(
                tween(this.node).call(()=>{
                    // 关闭freespin界面
                    UIMgr.Instance.closeUi("LevelCK_FreeSpinOver_Ctrl");
                    // 播放音效
                    let soundFile = this.m_levelConfig.SoundsFile["FreeSpinOver"];
                    if (soundFile){
                        SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
                    }
                    this.excuteListFunc();
                })
            );
            tween(this.node).sequence(...anims).start();
        }else {
            this.excuteListFunc();
        }
    }

    public enterOtherGame() {
        let action = LevelMgr.Instance.getLevelModel().getAction();
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
        if (action == ActionType.RESPIN && nextAction == ActionType.NORMAL) {
            GlEventMgr.Instance.emit(EventName.ShowAmount);
            this.m_gameMainCompent.enterNormal();
        }else {
            // 恢复点击
            GlEventMgr.Instance.emit( EventName.RecoverSpinBtn )
        }
    }
}


