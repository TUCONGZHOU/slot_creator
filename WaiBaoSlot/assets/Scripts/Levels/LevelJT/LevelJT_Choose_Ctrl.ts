import { _decorator, Component, Node,Button, Vec3, Label, tween, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl, UIMgr } from '../../Mgr/UIMgr';
import { LevelConfig } from '../../InterFace/LevelConfig';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { Utils } from '../../Util/Utils';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';
import { ResMgr } from '../../Mgr/ResMgr';
import { SoundMgr } from '../../Mgr/SoundMgr';

@ccclass('LevelJT_Choose_Ctrl')
export class LevelJT_Choose_Ctrl extends UICtrl {
    private m_chooseMark:boolean = false;
    private m_winMul = 0;
    public m_levelConfig:LevelConfig = null;

    start() {

    }

    update(deltaTime: number) {
        
    }

    protected initView(): void {
        this.showOther( false )
        this.view["Label"].getComponent(Label).string = "0";

        // 添加按钮监听
        this.addButtonClick("317_128", this, this.sendChoose128);
        this.addButtonClick("317_118", this, this.sendChoose118);
        this.addButtonClick("317_108", this, this.sendChoose108);
        this.addButtonClick("317_98", this, this.sendChoose98);
        this.addButtonClick("317_88", this, this.sendChoose88);
        this.addButtonClick("317_topup", this, this.sendChooseReSpin);
    }
    public showOther(bool:boolean){
        this.view["SpriteSplash"].active = bool;
        this.view["skeleton"].active = bool;
        this.view["317_88"].active = bool;
        this.view["317_98"].active = bool;
        this.view["317_108"].active = bool;
        this.view["317_118"].active = bool;
        this.view["317_128"].active = bool;
        this.view["317_topup"].active = bool;
    }
    public flyAddMult(addMult:number,bonusData:any[],worldPos:Vec3,flyTime:number,index:number){
        // 收集
        let prefab:Prefab = ResMgr.Instance.getAsset('LevelJT',"Prefabs/Socre_linghting_red",Prefab);
        let bonusNode = instantiate(prefab);
        bonusNode.setScale(3,3,3)
        bonusNode.getChildByName('lb_text').getComponent(Label).string = addMult.toString()
        this.node.addChild(bonusNode);
        let localPos = new Vec3();
        // 将世界坐标转化为局部坐标
        this.node.inverseTransformPoint(localPos,worldPos);
        bonusNode.setPosition( localPos );
        bonusNode.getChildByName('skeleton').active = false

        const endPos = this.view["Label"].getPosition()
        const anims: Array<ReturnType<typeof tween>> = [];
        // anims.push(
        //     tween(bonusNode).delay(0.5)
        // );
        anims.push(
            tween(bonusNode).to(flyTime,endPos)
        );
        // anims.push(
        //     tween(bonusNode).delay(2)
        // );
        anims.push(
            tween(bonusNode).call(()=>{
                this.m_winMul = this.m_winMul + addMult;
                this.view["Label"].getComponent(Label).string = this.m_winMul.toString();

                bonusNode.active = false;
                bonusNode.destroy();
            })
        );
        tween(bonusNode).sequence(...anims).start();

        let soundFile = this.m_levelConfig.SoundsFile["RedBonusToButtom" + (index + 1)];
        SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
    }
    public showAll(){
        let soundFile = this.m_levelConfig.SoundsFile["ChooseLayerBg"];
        SoundMgr.Instance.playBGM( this.m_levelConfig.BundleName,soundFile );
        this.showOther( true )
    }
    
    public initUI(levelConfig:LevelConfig):void{
        this.m_levelConfig = levelConfig
        SoundMgr.Instance.stopBGM();
    }
    public sendChoose128(button: Button){
        this.sendChooseFree( button )
    }
    public sendChoose118(button: Button){
        this.sendChooseFree( button )
    }
    public sendChoose108(button: Button){
        this.sendChooseFree( button )
    }
    public sendChoose98(button: Button){
        this.sendChooseFree( button )
    }
    public sendChoose88(button: Button){
        this.sendChooseFree( button )
    }

    // 点击spin按钮
    public sendChooseFree(button: Button): void {
        if (this.m_chooseMark) {
            return;
        }
        this.playClickSound();
        this.m_chooseMark = true;
        this.resetZOrder(button);
        this.showFrameLight(button);
        // -- 请求数据
        // LevelMgr.Instance.requestSpin();
        this.closeUi()
    }
    public sendChooseReSpin(button: Button): void {
        if (this.m_chooseMark) {
            return;
        }
        this.playClickSound();
        this.m_chooseMark = true;
        this.resetZOrder(button);
        this.showFrameLight(button);
        
        // -- 请求数据
        // LevelMgr.Instance.requestSpin();
        this.closeUi()
    }
    public resetZOrder( button: Button ){
        this.view['317_128'].setSiblingIndex(1)
        this.view['317_118'].setSiblingIndex(1)
        this.view['317_108'].setSiblingIndex(1)
        this.view['317_98'].setSiblingIndex(1)
        this.view['317_88'].setSiblingIndex(1)
        this.view['317_topup'].setSiblingIndex(1)
        this.view['SpriteSplash'].setSiblingIndex(10)
        this.view['skeleton'].setSiblingIndex(11)
        this.view['317each_wins'].setSiblingIndex(12)
        this.view['Label'].setSiblingIndex(13)
        button.node.setSiblingIndex(15)
    }
    public showFrameLight(button: Button){
        this.view['317_bonuscard'].active = true
        let pos:Vec3 = button.node.getPosition()
        this.view['317_bonuscard'].setPosition( pos )
    }
    public playClickSound(){
        let soundFile = this.m_levelConfig.SoundsFile["ChooseLayerClick"];
        SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
    }
    public closeUi(){
        Utils.performWithDelay(this.node,()=>{
            UIMgr.Instance.closeUi("LevelJT_Choose_Ctrl");
            GlEventMgr.Instance.emit(EventName.ExcuteSlotFunction);
            SoundMgr.Instance.stopBGM();
        },3)
    }
}


