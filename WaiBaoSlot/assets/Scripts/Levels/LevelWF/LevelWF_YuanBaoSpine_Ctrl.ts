import { _decorator, Component, Node, sp, Vec3,tween } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl } from '../../Mgr/UIMgr';
import { LevelConfig } from '../../InterFace/LevelConfig';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { SoundMgr } from '../../Mgr/SoundMgr';
import { Utils } from '../../Util/Utils';

@ccclass('LevelWF_YuanBaoSpine_Ctrl')
export class LevelWF_YuanBaoSpine_Ctrl extends UICtrl {

    private m_levelConfig:LevelConfig = null;

    start() {
        // -- 播放spine动画
        this.playCoinAction();
    }

    update(deltaTime: number) {
        
    }

    protected initView(): void {
    
    }
    
    public initUI( levelConfig:LevelConfig ):void{
        this.m_levelConfig = levelConfig
    }

    public playCoinAction():void {
        // -- 播放spine动画
        let spineNode = this.node.getChildByName("skeleton")
        let spine = spineNode.getComponent(sp.Skeleton) as sp.Skeleton;
        if (spine) {
            spine.setAnimation(0, "Game2-yuanbao", false);
        }
    }

    public getNodeWorldPos(index:number):Vec3{
        const node = this.node.getChildByName(`Node${index}`);
        return node ? node.worldPosition : new Vec3();
    }

    public playYuanBaoEnterRepinAaction( callBack:Function ):void {
        let respinInfo = LevelMgr.Instance.getLevelModel().getReSpin();
        let spineName = "";
        let index = 0;
        if(respinInfo.type == 2){
            spineName = "Game2-yuanbao-3";
            index = 2;
        }
        else if(respinInfo.type == 3){
            spineName = "Game2-yuanbao-2";
            index = 3;
        }
        else if(respinInfo.type == 4){
            spineName = "Game2-yuanbao-1";
            index = 4;
        }
        else if(respinInfo.type == 5){
            spineName = "Game2-yuanbao-4";
            index = 5;
        }

        // 播放音效
        const anims: Array<ReturnType<typeof tween>> = [];
        for( let i = 1;i <= index;i++ ){
            anims.push(
                tween(this.node).call(()=>{
                    let soundFile = this.m_levelConfig.SoundsFile["EnterReSpin"+i];
                    if (soundFile){
                        SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
                    }
                })
            );
            anims.push(
                tween(this.node).delay(0.5)
            );
            anims.push(
                tween(this.node).call(()=>{
                    let soundFile = this.m_levelConfig.SoundsFile["Grow"+i];
                    if (soundFile){
                        SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
                    }
                })
            );
            anims.push(
                tween(this.node).delay(1.5)
            );
        }
        tween(this.node).sequence(...anims).start();
        
        let spineNode = this.node.getChildByName("skeleton")
        let spine = spineNode.getComponent(sp.Skeleton) as sp.Skeleton;
        if (spine) 
        {
            if ( callBack != null ){
                spine.setCompleteListener((entry: sp.spine.TrackEntry) => {
                    spine.setCompleteListener(null); // 清除监听器

                    // 播放音效
                    let soundFile = this.m_levelConfig.SoundsFile["ReSpinStart"];
                    if (soundFile){
                        SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
                    }

                    callBack();
                });
            }
            spine.setAnimation(0, spineName, false);
        }
    }
}


