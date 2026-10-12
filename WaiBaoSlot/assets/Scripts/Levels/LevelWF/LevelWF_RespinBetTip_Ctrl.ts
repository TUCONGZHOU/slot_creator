import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { EventName } from '../../Mgr/EventName';
import { LevelConfig } from '../../InterFace/LevelConfig';
const { ccclass, property } = _decorator;
import { LevelMgr } from '../../Mgr/LevelMgr';
import { SoundMgr } from '../../Mgr/SoundMgr';
import { Utils } from '../../Util/Utils';
import { UICtrl } from '../../Mgr/UIMgr';

@ccclass('LevelWF_RespinBetTip_Ctrl')
export class LevelWF_RespinBetTip_Ctrl extends UICtrl {

    m_levelConfig:LevelConfig = null;

    start() {

    }

    update(deltaTime: number) {
        
    }

    protected initView(): void {
    
    }

    public initData(levelConfig:LevelConfig,worldPos:Vec3,callBack:Function):void{

        this.view["NodeNum/Number2"].active = false;
        this.view["NodeNum/Number3"].active = false;
        this.view["NodeNum/Number4"].active = false;
        this.view["NodeNum/Number5"].active = true;

        this.m_levelConfig = levelConfig;
        // 播放音效
        let soundFile2 = this.m_levelConfig.SoundsFile["MultipleUp"];
        if (soundFile2){
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile2 );
        }
        let respinInfo = LevelMgr.Instance.getLevelModel().getReSpin();
        let riseUpBet = respinInfo.riseUpBet;
        let nums = [2,3,5,4,riseUpBet];

        this.node.setScale(0.1,0.1,1);
        tween(this.node)
        .to( 0.5, {scale: new Vec3(1, 1, 1)})
        .call(()=>{
            const anims: Array<ReturnType<typeof tween>> = [];
            for( let i = 0;i < nums.length;i++ ){
                anims.push(
                    tween(this.node).call(()=>{
                        this.playTipsAnim(nums[i]);
                    })
                );
                if (i < nums.length - 1 ){
                    anims.push(
                        tween(this.node).delay(0.2)
                    );
                }else {
                    anims.push(
                        tween(this.node).delay(1)
                    );
                }
            }

            anims.push(
                tween(this.node).call(()=>{
                    this.tipFlyAction(riseUpBet,worldPos,callBack);
                })
            );

            tween(this.node).sequence(...anims).start();
        })
        .start();
    }

    public playTipsAnim(index:number):void{
        // 播放动画
        this.view["NodeNum/Number2"].active = false;
        this.view["NodeNum/Number3"].active = false;
        this.view["NodeNum/Number4"].active = false;
        this.view["NodeNum/Number5"].active = false;
        this.view["NodeNum/Number"+index].active = true;
    }

    public tipFlyAction( riseUpBet:number,worldPos:Vec3,callBack:Function ):void{
        this.playTipsAnim(riseUpBet);
        // 播放音效
        let soundFile2 = this.m_levelConfig.SoundsFile["BellUp_03"];
        if (soundFile2){
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile2 );
        }

        // 将世界坐标转化为局部坐标
        let localPos = new Vec3();
        this.node.inverseTransformPoint(localPos,worldPos);
        tween(this.view["NodeNum"])
        .to( 0.5, {position: new Vec3(localPos.x, localPos.y, 1)})
        .call(()=>{
            this.node.destroy();
            if (callBack) {
                callBack();
            }
        })
        .start();
    }

    // 结算的时候的动画
    public jiesuanAction( levelConfig:LevelConfig,worldPos:Vec3,callBack:Function ):void{
        this.m_levelConfig = levelConfig;
        // 播放音效
        let soundFile2 = this.m_levelConfig.SoundsFile["MultilRespinOver"];
        if (soundFile2){
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile2 );
        }

        this.view["NodeNum/Number2"].active = false;
        this.view["NodeNum/Number3"].active = false;
        this.view["NodeNum/Number4"].active = false;
        this.view["NodeNum/Number5"].active = false;

        let respinInfo = LevelMgr.Instance.getLevelModel().getReSpin();
        let riseUpBet = respinInfo.riseUpBet;
        this.view["NodeNum/Number"+riseUpBet].active = true;

        // 设置位置
        let localPos = new Vec3();
        this.node.inverseTransformPoint(localPos,worldPos);
        this.view["NodeNum"].position = localPos;

        this.node.setScale(0.1,0.1,1);
        tween(this.node)
        .to( 0.3, {scale: new Vec3(1, 1, 1)})
        .call(()=>{
            tween(this.view["NodeNum"])
            .to( 0.5, {position: new Vec3(0, 0, 1)})
            .delay(1)
            .call(()=>{
                tween(this.node)
                .to(0.5,{scale:new Vec3(0,0,1)})
                .call(()=>{
                    // 下一步
                    this.node.destroy();
                    if (callBack) {
                        callBack();
                    }
                })
                .start();
            })
            .start();
        })
        .start();
    }
}


