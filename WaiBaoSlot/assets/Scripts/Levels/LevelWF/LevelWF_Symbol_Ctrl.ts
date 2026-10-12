import { _decorator, Component, Label, Node, sp,Tween,tween } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl } from '../../Mgr/UIMgr';
import { BaseSymbolUnit } from '../../GameBase/BaseSymbolUnit';
import { ActionType, SymbolRollData, SymbolViewType,StoredIconStruct } from '../../InterFace/LevelConfig';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { Utils } from '../../Util/Utils';
import { SoundMgr } from '../../Mgr/SoundMgr';

@ccclass('LevelWF_Symbol_Ctrl')
export class LevelWF_Symbol_Ctrl extends BaseSymbolUnit {

    private m_labelTween: Tween<{ value: number }> | null = null; // 金币滚动的动画

    private m_currentValue = 0;
    
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

        let action = LevelMgr.Instance.getLevelModel().getAction();
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();

        if( data.id != 94 && data.id != 95 && data.id != 96 && data.id != 97 && data.id != 98 && data.id != 99 ){
            if (action == ActionType.RESPIN){
                this.m_meta.node.getChildByName("SpriteSplash").active = true;
            }else{
                if(action == ActionType.NORMAL){
                    if ( this.m_viewRow != -1 ){
                        this.m_meta.node.getChildByName("SpriteSplash").active = true;
                    }else{
                        this.m_meta.node.getChildByName("SpriteSplash").active = false;
                    }
                }else {
                    this.m_meta.node.getChildByName("SpriteSplash").active = false;
                }
            }
        }
        
        // 针对bonus
        if( data.id == 94 )
        {
            if( data.posType && data.posType == SymbolViewType.View )
            {
                let row = data.row;
                if (this.m_viewRow != -1) {
                    row = this.m_viewRow;
                }
                let storeData = LevelMgr.Instance.getLevelModel().getStoredCoin( this.m_reelTableIndex,data.col,row );
                let multiple = storeData.Multiple;
                this.setBonusCountUI( multiple );
            }
            else 
            {
                let multiple = Utils.randomInt(1,50);
                this.setBonusCountUI( multiple );
            }
        }
    }

    public setBonusCountUI( multiple:number ):void {
        const bet = LevelMgr.Instance.getLevelModel().getBet();
        let coin = Utils.util_formatCoins( bet * multiple,3 );
        this.m_meta.node.getChildByName("lb_count").getComponent(Label).string = coin;
    }

    // 重写基类
    public playStopItAction():void{

        if (this.m_levelConfig && this.m_levelConfig.SymbolStopAction){
            let stopActionName = this.m_levelConfig.SymbolStopAction[this.m_data.id.toString()];
            if ( stopActionName != null && stopActionName != "" ){
                if(this.m_data.id == 95 || this.m_data.id == 96 || this.m_data.id == 97 || this.m_data.id == 98 || this.m_data.id == 99){
                    this.playActionByName( stopActionName,true,null );
                }
                else{
                    this.playActionByName( stopActionName,true,null );
                }
            }
        }

        if (this.m_data.id == 94) {
            let soundFile = this.m_levelConfig.SoundsFile["BonusStop"];
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
        }
        else if(this.m_data.id == 95 || this.m_data.id == 96 || this.m_data.id == 97 || this.m_data.id == 98 || this.m_data.id == 99){
            let soundFile = this.m_levelConfig.SoundsFile["BonusStop2"];
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
        }
    }

    // 播放增长动画
    public playBonusGroupUpAction( list:StoredIconStruct[] ):void{
        if (this.m_data.id == 94) {
            const bet = LevelMgr.Instance.getLevelModel().getBet();
            let col = this.m_reelUnitIndex;
            let row = this.m_viewRow;
            let storedIcons = LevelMgr.Instance.getLevelModel().getStoredIcons()[0];
            // 获取最终值
            let endMultiple = 0;
            for( let i = 0;i < storedIcons.length;i++ ){
                if (storedIcons[i].row == row && storedIcons[i].col == col){
                    endMultiple = storedIcons[i].Multiple;
                    break;
                }
            }
            // 拿到增加值
            let addMultiple = 0;
            for( let i = 0;i < list.length;i++ ){
                if (list[i].row == row && list[i].col == col){
                    addMultiple = list[i].Multiple;
                    break;
                }
            }
            // 计算初始值
            let startMultiple = endMultiple - addMultiple;
            let startCoin = startMultiple * bet;
            let endCoin = endMultiple * bet;

            if (startCoin >= endCoin){
                return;
            }

            this.bonusGroupUpAction( startCoin,endCoin );
        }
    }

    public bonusGroupUpAction( startCoin:number,endCoin:number):void{
        // 停止之前的动画，防止冲突
        if (this.m_labelTween) {
            this.m_labelTween.stop();
            this.m_labelTween = null;
        }
        if (this.m_data.id == 94) {
            if (startCoin >= endCoin){
                return;
            }
            let targetLabel = this.m_meta.node.getChildByName("lb_count").getComponent(Label);
            // 创建动画对象 执行滚动
            const animTarget = { value: startCoin };
            this.m_labelTween = tween(animTarget)
            .to(1, { value: endCoin }, {
                easing: 'sineOut', // 平滑缓动效果（结尾减速）
                onUpdate: () => {
                    // 逐帧更新数字
                    this.m_currentValue = Math.round(animTarget.value);
                    targetLabel.string = this._formatNumber(this.m_currentValue);
                }
            })
            .call(() => {
                // 动画结束强制修正为最终值
                this.m_currentValue = endCoin;
                targetLabel.string = this._formatNumber(this.m_currentValue);
                this.m_labelTween = null;
            })
            .start();
        }
    }

    /**
     * 格式化数字（整数显示，可自行修改）
     */
    private _formatNumber(num: number): string {
        let coin = Utils.util_formatCoins( num,3 );
        return coin.toString();
    }

    public clearState():void {
        super.clearState();

        if (this.m_meta != null && this.m_meta.node != null){
            let spriteSplash = this.m_meta.node.getChildByName("SpriteSplash");
            if ( spriteSplash ){
                spriteSplash.active = false;
            }
        }
        
        if (this.m_labelTween) {
            this.m_labelTween.stop();
            this.m_labelTween = null;
        }
    }
}


