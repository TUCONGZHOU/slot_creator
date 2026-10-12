import { _decorator, Component, instantiate, Node, Prefab, sp, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

import { BaseReelTable } from '../../GameBase/BaseReelTable';
import { SoundMgr } from '../../Mgr/SoundMgr';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { LevelEM_NormalReelUnit_Ctrl } from './LevelEM_NormalReelUnit_Ctrl';
import { ResMgr } from '../../Mgr/ResMgr';
import { Utils } from '../../Util/Utils';

@ccclass('LevelEM_NormalReelTable_Ctrl')
export class LevelEM_NormalReelTable_Ctrl extends BaseReelTable {

    protected initView(): void {
        super.initView();
    }

    start() {
        super.start();
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }

    public addQuickEffect( col:number ):void {

    }

    public removeQuickEffect( col:number ):void {

    }

    public playReelStopDoneSounds():void {
        let soundFile = this.m_levelConfig.SoundsFile["ReelStop"];
        SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
    }

    // 播放bonus信号块变化的动画
    public playChangeBonusAction():void {
        let respinInfo = LevelMgr.Instance.getLevelModel().getReSpin();
        if (respinInfo.birdTrigger != null && respinInfo.birdTrigger.length > 0){
            for (let i = 0; i < respinInfo.birdTrigger.length; i++){
                let birdInfo = respinInfo.birdTrigger[i];
                // 添加光爆炸的spine
                this.addGuangBaoEffect(birdInfo.col,birdInfo.row);
            }
        }
    }

    // 添加光的爆炸的spine
    public addGuangBaoEffect( col:number,row:number ):void {
        let guangPrefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/GuangBao",Prefab);
        if(guangPrefab){
            let guangNode = instantiate(guangPrefab);
            this.view["NodeGuang"].addChild(guangNode);
            let worldPos = this.getSymbolWorldPos( col,row );
            let localPos = new Vec3();
            // 将世界坐标转化为局部坐标
            this.view["NodeGuang"].inverseTransformPoint(localPos,worldPos);
            guangNode.position = localPos;
            // 设置层级
            guangNode.setSiblingIndex(100);

            // -- 播放spine动画
            let spineNode = guangNode.getChildByName("skeleton")
            let spine = spineNode.getComponent(sp.Skeleton) as sp.Skeleton;
            if (spine) {
                spine.setAnimation(0, "xyx_baokai", false);
                spine.setCompleteListener((entry: sp.spine.TrackEntry) => {
                    spine.setCompleteListener(null);
                    guangNode.destroy();
                });
            }
        }
        // 添加bonus的信号块
        Utils.performWithDelay(this.node,()=>{
            let bonusPrefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/Score_bonus",Prefab);
            if(bonusPrefab){
                let bonusNode = instantiate(bonusPrefab);
                this.view["NodeGuang"].addChild(bonusNode);
                let worldPos = this.getSymbolWorldPos( col,row );
                let localPos = new Vec3();
                // 将世界坐标转化为局部坐标
                this.view["NodeGuang"].inverseTransformPoint(localPos,worldPos);
                bonusNode.position = localPos;

                // -- 播放spine动画
                let spineNode = bonusNode.getChildByName("skeleton")
                let spine = spineNode.getComponent(sp.Skeleton) as sp.Skeleton;
                if (spine) {
                    spine.setAnimation(0, "Game3-bianpao2", true);
                }
            }
        },0.5)
        
    }

    
}


