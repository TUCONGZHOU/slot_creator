import { _decorator, Component, instantiate, Node,Prefab,tween, Vec3,sp } from 'cc';
const { ccclass, property } = _decorator;

import { BaseGameMain } from '../../GameBase/BaseGameMain';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { ActionType } from '../../InterFace/LevelConfig';
import { LevelTR_FreeSpinView_Ctrl } from './LevelTR_FreeSpinView_Ctrl';
import { SoundMgr } from '../../Mgr/SoundMgr';
import { UIMgr,UILayer } from '../../Mgr/UIMgr';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';
import { ResMgr } from '../../Mgr/ResMgr';
import { LevelTR_BonusStartView_Ctrl } from './LevelTR_BonusStartView_Ctrl';

@ccclass('LevelTR_MainUI_Ctrl')
export class LevelTR_MainUI_Ctrl extends BaseGameMain {

    protected initView(): void {
        super.initView();
    }

    start() {
        // 调用基类
        super.start();
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }

    // -- 刚进入游戏 根据状态切换轮盘
    public changeGameTableByEnter():void{
        // 调用基类
        super.changeGameTableByEnter();
        let action = LevelMgr.Instance.getLevelModel().getAction();
        if (action == ActionType.NORMAL){
            // 根据数据显示轮盘上的信号块 显示Normal轮盘 
            this.addNormalGameTableUI();
        }
    }

    // 进入freespin
    public enterFreeSpin():void{
        
        const anims: Array<ReturnType<typeof tween>> = [];
        // 要播放scatter的动画 
        let freeSpinCtrl:LevelTR_FreeSpinView_Ctrl = null;
        anims.push(
            tween(this.node).delay(1)
        );
        anims.push(
            tween(this.node).call(()=>{
                this.m_gameTableCompent.stopGameTableLineAction();
                this.m_gameTableCompent.getReelTableCompent(0).playAllScatterAction();
                // -- 音效
                let soundFile = this.m_levelConfig.SoundsFile["EnterFreeSpin"];
                if (soundFile){
                    SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
                }
            })
        );
        anims.push(
            tween(this.node).delay(2)
        );
        anims.push(
            tween(this.node).call(()=>{
                // 显示freespin界面
                freeSpinCtrl = UIMgr.Instance.showUi(this.m_abName,"Prefabs/FreeSpinView","LevelTR_FreeSpinView_Ctrl",UILayer.Normal) as LevelTR_FreeSpinView_Ctrl;
                freeSpinCtrl.initUI( this.m_levelConfig,this );
            })
        );

        tween(this.node).sequence(...anims).start();
    }

    // 进入normal
    public enterNormal():void{
        // 移除当前轮盘
        this.removeGameTable();
        // 添加normal的轮盘
        this.addNormalGameTableUI();
        // 恢复点击
        GlEventMgr.Instance.emit( EventName.RecoverSpinBtn )
        // 发送消息
        GlEventMgr.Instance.emit(EventName.ClearWinAmount);
        // 改变bg
        GlEventMgr.Instance.emit(EventName.ChangeBg,true);
    }

    public enterBonus():void{
        // 播放音效
        let soundFile = this.m_levelConfig.SoundsFile["EnterFreeSpin"];
        if (soundFile){
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile ); 
        }
        // 显示bonus界面
        let bonusSpinCtrl:LevelTR_BonusStartView_Ctrl = UIMgr.Instance.showUi(this.m_abName,"Prefabs/BonusStartView","LevelTR_BonusStartView_Ctrl",UILayer.Normal) as LevelTR_BonusStartView_Ctrl;
        bonusSpinCtrl.initUI( this.m_levelConfig );
    }

    // wild的飞行动画
    public wildFlyAction( col:number,row:number ){
        // 播放spine动画
        let piaoPrefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/Piao",Prefab);
        if(piaoPrefab){
            let piaoNode = instantiate(piaoPrefab);
            this.node.addChild(piaoNode);
            let worldPos = this.m_gameTableCompent.getSymbolWorldPos( 0,col,row );
            let localPos = new Vec3();
            // 将世界坐标转化为局部坐标
            this.node.inverseTransformPoint(localPos,worldPos);
            piaoNode.position = localPos;
            piaoNode.scale = new Vec3(0.5,0.5,1)

            // SpineTree
            let destPos = this.view["SpineTree"].getPosition();

            tween(piaoNode)
            .parallel(
                // 1. 上升
                tween(piaoNode).to( 1, {position: destPos}, { easing: 'quadInOut' }),
                tween(piaoNode).sequence(
                    // 2. 接着 1 秒内：先放大到2倍，再缩回1倍
                    tween().to(0.5, { scale: new Vec3(1, 1, 1) }),
                    tween().to(0.5, { scale: new Vec3(0.1, 0.1, 1) })
                )
            )
            // 3. 结束后移除
            .call(() => {
                // 音效
                let soundFile = this.m_levelConfig.SoundsFile["TreeGlow"];
                if (soundFile){
                    SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
                }
                // 播放spine动画
                let spine = this.view["SpineTree/315_tree"].getComponent(sp.Skeleton);
                spine.setAnimation(0, "tree_sj", false);
                spine.setCompleteListener((entry: sp.spine.TrackEntry) => {
                    spine.setCompleteListener(null); // 清除监听器
                    spine.setAnimation(0, "tree_stay", true);
                });

                if (piaoNode.isValid) {
                    piaoNode.removeFromParent();
                    piaoNode.destroy();
                }
            })
            .start();
        }
    }
}


