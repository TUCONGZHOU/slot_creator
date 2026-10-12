import { _decorator, Component, Node, sp, tween, Tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl } from '../../Mgr/UIMgr';
import { LevelConfig } from '../../InterFace/LevelConfig';

import { LevelMgr } from '../../Mgr/LevelMgr';
import { LevelEM_GameModel } from './LevelEM_GameModel';

@ccclass('LevelEM_Wheel_Ctrl')
export class LevelEM_Wheel_Ctrl extends UICtrl {

    public n: number = 12; // 转盘等分数量
    public slowSpeed: number = 30; // 缓慢旋转速度（度/秒）

    private isSpinning: boolean = false;
    private currentAngle: number = 0;

    private m_posY1:number = 0;
    private m_posY2:number = 0;
    private m_posY3:number = 0;

    private m_posX1:number = 0;
    private m_posX2:number = 0;

    protected initView(): void {
        this.m_posX1 = this.view["Node1"].position.x;
        this.m_posX2 = this.view["Node2"].position.x;

        this.m_posY1 = this.view["Node1"].position.y;
        this.m_posY2 = this.m_posY1 + 40;
        this.m_posY3 = this.m_posY2 + 40;

        // 初始化坐标
        let leftCount:number = (LevelMgr.Instance.getLevelModel() as LevelEM_GameModel).getCollectLeftCount();
        if (leftCount == 1){
            this.view["Node1"].position = new Vec3(this.m_posX1,this.m_posY2,0);
        } else if (leftCount == 2){
            this.view["Node1"].position = new Vec3(this.m_posX1,this.m_posY3,0);
        }

        let rightCount:number = (LevelMgr.Instance.getLevelModel() as LevelEM_GameModel).getCollectRightCount();
        if (rightCount == 1){
            this.view["Node2"].position = new Vec3(this.m_posX2,this.m_posY2,0);
        } else if (rightCount == 2){
            this.view["Node2"].position = new Vec3(this.m_posX2,this.m_posY3,0);
        }
    }

    start() {
        this.startSlowRotate();
    }

    /**
     * 缓慢旋转
     */
    private startSlowRotate() {
        this.unschedule(this.slowRotateTick);
        this.schedule(this.slowRotateTick, 0.05);
    }

    private slowRotateTick() {
        if (this.isSpinning) return;

        // 逆时针：currentAngle 递增，但 node.angle 设为负值
        this.currentAngle += this.slowSpeed * 0.05;
        this.view["NodeWheel"].angle = this.currentAngle; // ✅ 正值 = 逆时针
    }

    /**
     * 逆时针快速转到指定区间正中间
     */
    public spinTo(index: number, roundCount: number = 2) {
        if (index < 1 || index > this.n) {
            console.error('index 超出范围');
            return;
        }

        this.isSpinning = true;
        this.unschedule(this.slowRotateTick);

        const anglePerSector = 360 / this.n;

        // 当前角度归一化
        const currentNormalized = this.currentAngle % 360;

        // 目标区间正中间
        const targetMiddle = (index - 1) * anglePerSector + anglePerSector / 2 - (360 / this.n / 2);

        // 计算逆时针需要转多远
        let delta = targetMiddle - currentNormalized;
        if (delta <= 0) delta += 360;

        // 加额外圈数
        delta += 360 * roundCount;

        const targetAngle = this.currentAngle + delta;

        console.log(`当前角度: ${currentNormalized}, 目标角度: ${targetMiddle}, 需要旋转: ${delta} 度, 最终角度: ${targetAngle}`);

        const tweenObj = { angle: this.currentAngle };

        tween(tweenObj)
            .to(2.5, { angle: targetAngle }, {
                easing: 'cubicOut',
                onUpdate: () => {
                    this.currentAngle = tweenObj.angle;
                    this.view["NodeWheel"].angle = this.currentAngle; // ✅ 正值 = 逆时针
                }
            })
            .call(() => {
                this.currentAngle = targetAngle % 360;
                this.isSpinning = false;
                // this.startSlowRotate();
                console.log(`停在：第 ${index} 区间正中间`);
            })
            .start();
    }

    update(deltaTime: number) {
        
    }

    public initUI( levelConfig:LevelConfig ):void{
            
    }

    public playBirdCollectAction( type:number ):void{
        if( type == 1 ){
            let spineNode = this.view["Node1/skeleton"];
            if(spineNode){
                let spine = spineNode.getComponent(sp.Skeleton);
                spine.setAnimation(0, "Game3-standbird-a", false);
                spine.setCompleteListener((entry: sp.spine.TrackEntry) => {
                    spine.setCompleteListener(null); // 清除监听器
                    spine.setAnimation(0, "Game3-standbird-c", true);
                });
            }
            // 节点1移动
            let leftCount:number = (LevelMgr.Instance.getLevelModel() as LevelEM_GameModel).getCollectLeftCount();
            let pos = 0;
            if(leftCount == 1){
                pos = this.m_posY2;
            } else if(leftCount == 2){
                pos = this.m_posY3;
            }
            tween(this.view["Node1"])
            .to(0.5,{ position:new Vec3(this.m_posX1,pos,0) })
            .start();
        } else if( type == 2 ){
            let spineNode = this.view["Node2/skeleton"];
            if(spineNode){
                let spine = spineNode.getComponent(sp.Skeleton);
                spine.setAnimation(0, "Game3-standbird-a", false);
                spine.setCompleteListener((entry: sp.spine.TrackEntry) => {
                    spine.setCompleteListener(null);
                    spine.setAnimation(0, "Game3-standbird-c", true);
                });
            }
            // 节点2移动
            let pos = 0;
            let rightCount = (LevelMgr.Instance.getLevelModel() as LevelEM_GameModel).getCollectRightCount();
            if(rightCount == 1){
                pos = this.m_posY2;
            } else if(rightCount == 2){
                pos = this.m_posY3;
            }
            tween(this.view["Node2"])
            .to(0.5,{ position:new Vec3(this.m_posX2,pos,0) })
            .start();
        }
    }

    // 小鸟节点回位动画
    public resetBirdNodePosAction():void{
        let spineNode = this.view["Node1/skeleton"];
        if(spineNode){
            let spine = spineNode.getComponent(sp.Skeleton);
            spine.setAnimation(0, "Game3-standbird-b", false);
            spine.setCompleteListener((entry: sp.spine.TrackEntry) => {
                spine.setCompleteListener(null); // 清除监听器
                spine.setAnimation(0, "Game3-standbird-c", true);
            });
        }
        // 节点1移动
        let posY1 = this.view["Node1"].position.y;
        if (posY1 != this.m_posY1){
            tween(this.view["Node1"])
            .to(0.5,{ position:new Vec3(this.m_posX1,this.m_posY1,0) })
            .start();
        }

        let spineNode2 = this.view["Node2/skeleton"];
        if(spineNode2){
            let spine = spineNode2.getComponent(sp.Skeleton);
            spine.setAnimation(0, "Game3-standbird-b", false);
            spine.setCompleteListener((entry: sp.spine.TrackEntry) => {
                spine.setCompleteListener(null);
                spine.setAnimation(0, "Game3-standbird-c", true);
            });
        }

        // 节点2移动
        let posY2 = this.view["Node2"].position.y;
        if (posY2 != this.m_posY1){
            tween(this.view["Node2"])
            .to(0.5,{ position:new Vec3(this.m_posX2,this.m_posY1,0) })
            .start();
        }
    }
}


