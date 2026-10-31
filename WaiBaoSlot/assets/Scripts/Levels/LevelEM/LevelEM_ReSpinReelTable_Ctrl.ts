import { _decorator, Component, Node,Prefab,instantiate,Vec3, tween, sp,assert,Label } from 'cc';
const { ccclass, property } = _decorator;

import { BaseReelTable } from '../../GameBase/BaseReelTable';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { ResMgr } from '../../Mgr/ResMgr';
import { LevelConfig,ReelTableConfig,ReelUnitConfig,SymbolType,ActionType } from '../../InterFace/LevelConfig';
import { Utils } from '../../Util/Utils';

@ccclass('LevelEM_ReSpinReelTable_Ctrl')
export class LevelEM_ReSpinReelTable_Ctrl extends BaseReelTable {

    start() {
        super.start();
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }

    protected initView(): void {
        super.initView();
    }

    public setReSpinCountUI():void {
        let respinInfo = LevelMgr.Instance.getLevelModel().getReSpin();
        this.view["FreeTimes/lb_count"].getComponent(Label).string = respinInfo.reSpinCurCount;
    }

    
    private getBonusPrefabPath(width:number,height:number):string{
        if(width == 1 && height == 2){
            return "Prefabs/Bonus1_2";
        }
        else if(width == 1 && height == 3){
            return "Prefabs/Bonus1_3";
        }
        else if(width == 2 && height == 2){
            return "Prefabs/Bonus2_2";
        }
        else if(width == 2 && height == 3){
            return "Prefabs/Bonus2_3";
        }
        else if(width == 3 && height == 2){
            return "Prefabs/Bonus3_2";
        }
        else if(width == 3 && height == 3){
            return "Prefabs/Bonus3_3";
        }
        else if(width == 4 && height == 2){
            return "Prefabs/Bonus4_2";
        }
        else if(width == 4 && height == 3){
            return "Prefabs/Bonus4_3";
        }
        else if(width == 5 && height == 2){
            return "Prefabs/Bonus5_2";
        }
        else if(width == 5 && height == 3){
            return "Prefabs/Bonus5_3";
        }
        return ""
    }

    public playStartReSpinAction( actionName:string,isLoop:boolean ):void
    {
        //设置次数
        this.setReSpinCountUI();

        let reelData:number[][] = LevelMgr.Instance.getLevelModel().getRespinReelData()[this.m_reelTableIndex];
        assert( reelData != null," !! reelData is nil !! " )
        for (let i = 0; i < this.m_reelUnitsCount; i++) {
            let onnColData = reelData[i];
            for (let j = 0; j < onnColData.length; j++) {
                let symbolId = onnColData[j];
                let config = LevelMgr.Instance.getSymbolConfig( symbolId ); 
                if ( config.type == SymbolType.BONUS ){
                    if ( actionName != "" ){
                        this.playSymbolAction( i,j,actionName,isLoop,false,null );
                    }
                }
            }
        }

        Utils.performWithDelay(this.node,()=>{
            this.createBonusSpineToReelTable();
        },0.5)
    }

    private createBonusSpineToReelTable():void{
        let respinInfo = LevelMgr.Instance.getLevelModel().getReSpin();
        let reelUnit = respinInfo.reelUnit;

        for (let meta of reelUnit){
            let path = this.getBonusSpinePrefabPath(meta.width,meta.height);
            if( path != "" ){
                let bonusPrefab = ResMgr.Instance.getAsset(this.m_abName,path,Prefab);
                if(bonusPrefab){
                    let bonusNode = instantiate(bonusPrefab);
                    this.view["Node1"].addChild(bonusNode);
                    let worldPos = this.getSymbolWorldPos( meta.col,meta.row );
                    let localPos = new Vec3();
                    // 将世界坐标转化为局部坐标
                    this.view["Node1"].inverseTransformPoint(localPos,worldPos);
                    bonusNode.position = localPos;

                    // 播放动画
                    let spineNode = bonusNode.getChildByName("skeleton");
                    if(spineNode){
                        let spine = spineNode.getComponent(sp.Skeleton);
                        spine.setAnimation(0, "Game3-bianpao-star", false);
                        spine.setCompleteListener((entry: sp.spine.TrackEntry) => {
                            spine.setCompleteListener(null); // 清除监听器
                            spine.setAnimation(0, "Game3-bianpao2", true);
                        });
                    }
                }
            }
        }
    }

    private getBonusSpinePrefabPath(width:number,height:number):string{
        if(width == 1 && height == 2){
            return "Prefabs/BonusSpine1_2";
        }
        else if(width == 1 && height == 3){
            return "Prefabs/BonusSpine1_3";
        }
        else if(width == 2 && height == 2){
            return "Prefabs/BonusSpine2_2";
        }
        else if(width == 2 && height == 3){
            return "Prefabs/BonusSpine2_3";
        }
        else if(width == 3 && height == 2){
            return "Prefabs/BonusSpine3_2";
        }
        else if(width == 3 && height == 3){
            return "Prefabs/BonusSpine3_3";
        }
        else if(width == 4 && height == 2){
            return "Prefabs/BonusSpine4_2";
        }
        else if(width == 4 && height == 3){
            return "Prefabs/BonusSpine4_3";
        }
        else if(width == 5 && height == 2){
            return "Prefabs/BonusSpine5_2";
        }
        else if(width == 5 && height == 3){
            return "Prefabs/BonusSpine5_3";
        }
        return ""
    }
}


