import { _decorator, Component, Label, Node, tween } from 'cc';
const { ccclass, property } = _decorator;

import { BaseReelTable } from '../../GameBase/BaseReelTable';
import { SymbolMgr } from '../../Mgr/SymbolMgr';
import { SoundMgr } from '../../Mgr/SoundMgr';
import { ResMgr } from '../../Mgr/ResMgr';
import { ActionType } from '../../InterFace/LevelConfig';
import { LevelMgr } from '../../Mgr/LevelMgr';

@ccclass('LevelJT_FreeReelTable_Ctrl')
export class LevelJT_FreeReelTable_Ctrl extends BaseReelTable {
    public m_redBounsSoundIndex:number = 0 // 每次spin，红色bonus落地音效序号 
    public m_goldBounsSoundIndex:number = 0 // 每次spin，红色bonus落地音效序号
    public m_greenBounsSoundIndex:number = 0 // 每次spin，红色bonus落地音效序号
    protected initView(): void {
        // this.m_redBounsSoundIndex = this.getCurBonusNumById( 94 );
        // this.m_goldBounsSoundIndex = this.getCurBonusNumById( 95 );
        // this.m_greenBounsSoundIndex = this.getCurBonusNumById( 96 );
        super.initView();
        let freeSpinInfo = LevelMgr.Instance.getLevelModel().getFreeSpinInfo();
        this.view['317db/FreeSpinLabel'].getComponent(Label).string = freeSpinInfo.freeSpinsLeftCount.toString()
    }


    start() {
        super.start();
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }

    // 轮盘滚动
    public startRoll():void {
        let freeSpinInfo = LevelMgr.Instance.getLevelModel().getFreeSpinInfo();
        this.view['317db/FreeSpinLabel'].getComponent(Label).string = (freeSpinInfo.freeSpinsLeftCount - 1).toString()

        this.m_redBounsSoundIndex = 0;
        this.m_goldBounsSoundIndex = 0;
        this.m_greenBounsSoundIndex = 0;

        super.startRoll()
    }

    public resetFreeSpinNum(){
        let freeSpinInfo = LevelMgr.Instance.getLevelModel().getFreeSpinInfo();
        this.view['317db/FreeSpinLabel'].getComponent(Label).string = freeSpinInfo.freeSpinsLeftCount.toString()
    }

    public playReelStopDoneSounds():void {
        let soundFile = this.m_levelConfig.SoundsFile["ReelStop"];
        SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
    }

    // 播放wild飞行动画
    public wildFlyAction( col:number,row:number ){
        this.m_gameTableCompent.wildFlyAction(col,row);
    }

    // 重写基类
    public playLineAction( tableLine:any ):void {
        if ( tableLine.length == 0 ){
            return;
        }
        
        // -- 先显示所有连线
        if (this.m_lineTween) {
            this.m_lineTween.stop();
            this.m_lineTween = null;
        }
        this.m_lineTween = tween(this.m_effectNode)
        .call(()=>{
            for( let lineData of tableLine ){
                this.playLineAndEffectAction( lineData )
            }
        })
        .delay(2)
        .call(()=>{
            // 清除特效层
            this.clearEffect();
        })
        .union() // 把前面一串动画打包成一个整体
        .repeatForever()
        .start();
    }

    // 重写基类
    public addPaoMaDengEffect( meta:any ){
        let id = meta.id;
        let col = meta.col;
        let row = meta.row;
        this.playSymbolLineAction( id,col,row );
    }

    public getNextBonusSoundNumById( id ){
        if (id == 94){
            return ++this.m_redBounsSoundIndex;
        }else if(id == 95){
            return ++this.m_goldBounsSoundIndex;
        }else if(id == 96){
            return ++this.m_greenBounsSoundIndex;
        }
    }
    public getCurBonusNumById( id ){
        let reSpinData = LevelMgr.Instance.getLevelModel().getStoredIcons();
        let num:number = 0;
        for (let meta of reSpinData){
            if (meta.id == id){
                num++;
            }
        }
        return Math.min(num,5);
    }
}


