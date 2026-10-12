import { _decorator, Component, Label, Node, sp, tween, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl } from '../../Mgr/UIMgr';
import { BaseSymbolUnit } from '../../GameBase/BaseSymbolUnit';
import { ActionType, SymbolRollData, SymbolViewType } from '../../InterFace/LevelConfig';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { Utils } from '../../Util/Utils';
import { SoundMgr } from '../../Mgr/SoundMgr';

@ccclass('LevelTR_Symbol_Ctrl')
export class LevelTR_Symbol_Ctrl extends BaseSymbolUnit {
    
    protected initView(): void {
        super.initView();
    }
    
    start() {
        super.start();
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }

    public loadLogicDataUI( data:SymbolRollData ):void {
        
    }

    public playStopItAction():void{
        super.playStopItAction();

        // 播放飞行动画
        if (this.m_data.id == 92 || this.m_data.id == 93){
            let soundFile = this.m_levelConfig.SoundsFile["Wild"];
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );

            this.m_reelTableCompent.wildFlyAction(this.m_data.col,this.m_data.row)
        }
    }

    // 重写基类
    public resetOpacity():void {
        // 渐隐的组件
        if (this.m_config.actype == "normal"){
            this.stopOpacityLoop();
            let opacityIcon = this.m_meta.node.getChildByName("opacityIcon");
            const uiOpacity = opacityIcon.getComponent(UIOpacity);
            uiOpacity.opacity = 255;
        }
    }

    // 重写基类
    public playActionByName( actionName:string,isLoop:boolean,callBack:Function|null,isLineAction:boolean = false ):void {
        if ( this.m_meta == null || this.m_meta.node.active == false || this.m_config == null ){
            return;
        }
        if ( this.m_data.posType == null || this.m_data.posType != SymbolViewType.View ){
            return;
        }
        if ( this.m_data.pos > 1 || actionName == "" ){
            return;
        }

        if ( this.m_config.actype == "spine" ){
            // -- 播放spine动画
            let spineNode = this.m_meta.node.getChildByName("skeleton")
            let spine = spineNode.getComponent(sp.Skeleton) as sp.Skeleton;
            if (spine) {
                // 用这这个接口
                if ( !isLoop && callBack != null ){
                    spine.setCompleteListener((entry: sp.spine.TrackEntry) => {
                        spine.setCompleteListener(null); // 清除监听器
                        callBack();
                    });
                }

                if (this.m_data.id == 93 && this.m_data.col == 2 && isLineAction){
                    actionName = "TREE of WEALTH_dfdg2X3";
                }
                spine.setAnimation(0, actionName, isLoop);
            }
            else {
                console.log("======> spine动画没有找到动画组件 spine symbolId = " + this.m_data.id );
            }
        }
        else if (this.m_config.actype == "normal"){
            // 隐-显-隐
            let opacityIcon = this.m_meta.node.getChildByName("opacityIcon");
            const uiOpacity = opacityIcon.getComponent(UIOpacity)
            this.m_tweenOpacity = tween(uiOpacity)
                .delay(0.9)
                .to(0.05, { opacity: 0 })
                .delay(0.9)
                .to(0.05, { opacity: 255 })
                // .delay(3)
                // .union() // 把前面一串动画打包成一个整体
                // .repeatForever();

            this.m_tweenOpacity.start();
        }
    }

    // 重写基类
    onDisable() {
        if ( this.m_config.actype == "spine" )
        {
            let spine = this.m_meta.node.getChildByName("skeleton").getComponent(sp.Skeleton);
            if (spine) {
                spine.clearTracks(0);
                // 关键：回到第 0 帧（初始状态）
                spine.setToSetupPose();
            }
        }
        else if ( this.m_config.actype == "normal" ){
            this.stopOpacityLoop()
        }
    }
}


