import { _decorator, Component, Node,Vec3,AnimationClip,Animation,assetManager,AudioClip,Prefab,instantiate,sp,tween, utils, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl } from '../../Mgr/UIMgr';

import { BaseReelTable } from '../../GameBase/BaseReelTable';

import { SymbolMgr } from '../../Mgr/SymbolMgr';
import { SoundMgr } from '../../Mgr/SoundMgr';
import { ResMgr } from '../../Mgr/ResMgr';
import { Utils } from '../../Util/Utils';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';
import { SymbolType } from '../../InterFace/LevelConfig';
import { LevelMgr } from '../../Mgr/LevelMgr';

@ccclass('LevelCK_NormalReelTable_Ctrl')
export class LevelCK_NormalReelTable_Ctrl extends BaseReelTable {

    protected initView(): void {
        super.initView();

        GlEventMgr.Instance.on(EventName.View_CK_LevelSpin_responese, this.playeLongAction, this);
    }

    public m_quickMetaBg:any[] = []; // 记录快滚
    public m_quickMeta:any[] = []; // 记录快滚

    start() {
        super.start();
        this.view["NodeLong"].active = false;
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }

    // 重写基类
    public checkNeedQuickRoll( viewSymbolData:number[][],col:number ):any {
        let hasCount = 0;
        let result:any = {}
        result.needQuickRoll = false;
        result.scatterCount = 0;
        for( let i = 0; i < col; i++ ){
            if ( this.hasScatterSymbol(viewSymbolData[i]) ){
                hasCount = hasCount + 1;
            }
        }
        // 针对scatterId
        if ( hasCount >= 2 ){
            result.needQuickRoll = hasCount >= 2; // 是否需要快滚
            result.scatterCount = hasCount;
        }else{
            // bonusId
            hasCount = 0;
            for( let i = 0; i <= col; i++ ){
                for( const symbolId of viewSymbolData[i] ){
                    let config = LevelMgr.Instance.getSymbolConfig( symbolId );
                    if ( config.type == SymbolType.BONUS ){
                        hasCount = hasCount + 1;
                    }
                }
            }
            if ( hasCount >= 4 ){
                result.needQuickRoll = hasCount >= 4; // 是否需要快滚
                result.scatterCount = hasCount;
            }
        }
        
        return result;
    }

    public addQuickEffect( col:number ):void {
        // 添加快滚
        let cmeta = SymbolMgr.Instance.getEffectNodeByName("quickRun");
        cmeta.node.parent = this.view["Reel"+col].parent;
        cmeta.node.active = true;
        let position = this.view["Reel"+col].position;
        cmeta.node.position = new Vec3(position.x,position.y,position.z);
        let canimation = cmeta.node.getChildByName("WinFrameMermaid_run_01").getComponent(Animation);
        canimation.play(cmeta.config.actionName);
        canimation.getState(cmeta.config.actionName).wrapMode = AnimationClip.WrapMode.Loop; // 设置循环播放
        // 保存
        this.m_quickMeta[col] = cmeta
    }

    public removeQuickEffect( col:number ):void {
        if ( this.m_quickMeta[col] != null ){
            let meta = this.m_quickMeta[col];
            let animation = meta.node.getChildByName("WinFrameMermaid_run_01").getComponent(Animation);
            // 停止动画
            animation.stop();
            // 归还信号块
            SymbolMgr.Instance.resetEffectNodeUnUsed( meta );
            // 清空
            this.m_quickMeta[col] = null;
        }
    }

    // 添加DoorSpine动画
    public addDoorSpineEffect():void {
       // 播放关门的spine动画
        let doorPrefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/DoorSpine",Prefab);
        if(doorPrefab){
            let doorNode = new Node("DoorNode");
            this.node.addChild( doorNode );
            doorNode.setPosition(new Vec3(0,-7,0));

            let doorSpineNode = instantiate(doorPrefab);
            doorNode.addChild(doorSpineNode);
            // -- 播放spine动画
            let spine = doorSpineNode.getComponent(sp.Skeleton);
            spine.setAnimation(0, "Game1-door", false);
        }
    }

    public playReelStopDoneSounds():void {
        let soundFile = this.m_levelConfig.SoundsFile["ReelStop"];
        SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
    }

    public playeLongAction():void {
        // 音效
        let soundFile = this.m_levelConfig.SoundsFile["Long"];
        if (soundFile){
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
        }

        this.view["NodeLong"].active = true;
        this.view["NodeLong"].getComponent(UIOpacity).opacity = 0;
        let time = 1.6
        const anims: Array<ReturnType<typeof tween>> = [];
        anims.push(
            tween(this.view["NodeLong"].getComponent(UIOpacity))
            .to(1,{ opacity:255 } )
        );
        anims.push(
            tween(this.node).call(()=>{
                let spine = this.view["NodeLong/Mask1/long1"].getComponent(sp.Skeleton);
                spine.setAnimation(0, "Game1-long", false);
            })
        );
        anims.push(
            tween(this.node).delay(time)
        );
        anims.push(
            tween(this.node).call(()=>{
                let spine = this.view["NodeLong/Mask1/long2"].getComponent(sp.Skeleton);
                spine.setAnimation(0, "Game1-long", false);
            })
        );
        anims.push(
            tween(this.node).delay(time)
        );
        anims.push(
            tween(this.node).call(()=>{
                let spine = this.view["NodeLong/Mask1/long3"].getComponent(sp.Skeleton);
                spine.setAnimation(0, "Game1-long", false);
            })
        );
        anims.push(
            tween(this.node).delay(time)
        );
        anims.push(
            tween(this.node).call(()=>{
                let spine = this.view["NodeLong/Mask1/long4"].getComponent(sp.Skeleton);
                spine.setAnimation(0, "Game1-long", false);
            })
        );
        anims.push(
            tween(this.node).delay(2.5)
        );
        anims.push(
            tween(this.view["NodeLong"].getComponent(UIOpacity))
            .to(1,{ opacity:0 } )
            .call(()=>{
                this.view["NodeLong"].active = false;
                // 发送消息
                GlEventMgr.Instance.emit(EventName.View_LevelSpin_responese);
            })
        );
        tween(this.node).sequence(...anims).start();
    }
}


