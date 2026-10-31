import { _decorator, Component, Node,Label,Tween,tween,Vec3, ProgressBar,view } from 'cc';
import { UICtrl, UIMgr } from '../Mgr/UIMgr';
import { GlEventMgr } from '../Mgr/GlEventMgr';
import { EventName } from '../Mgr/EventName';
import { LevelMgr } from '../Mgr/LevelMgr';
import { SpinBtnP_Ctrl } from './SpinBtnP_Ctrl';
import { UILayer } from '../Mgr/UIMgr';
import { Utils } from '../Util/Utils';
import { PlayerMgr } from '../Mgr/PlayerMgr';
import { ActionType } from '../InterFace/LevelConfig';
import { ScreenManager } from '../Mgr/ScreenManager';

const { ccclass, property } = _decorator;

@ccclass('GameBottomNode_Ctrl')
export class GameBottomNode_Ctrl extends UICtrl {

    private m_winAmount: number = 0;

    private targetLabel: Label = null!;
    // 缓存当前数字
    private _currentValue: number = 0;
    // 缓存动画实例
    private _tween: Tween<{ value: number }> | null = null; // 金币滚动的动画

    private m_labelScale: ReturnType<typeof tween> | null = null; // label缩放动画

    private m_labelPosition:Vec3 = new Vec3(0,0,0);

    /**
     * 初始化视图 - 在这里进行所有初始化操作
     */
    protected initView(): void {
        // 添加SpinBtn
        const parentNode = this.view["spinBtnNode"];
        if (parentNode) {
            UIMgr.Instance?.showUi("GameMain", "Prefabs/SpinBtnP", "SpinBtnP_Ctrl",UILayer.Normal, parentNode);
        } else {
            console.warn("[GameBottomNode_Ctrl] 未找到 spinBtnNode 节点");
        }

        // -- 显示获得的金币
        GlEventMgr.Instance.on(EventName.ShowAmount, this.refreshWinUI, this);

        // 单独的金币滚动动画
        GlEventMgr.Instance.on(EventName.StartAmountScroll, this.startScroll, this);

        // 金币进度条增长动画
        GlEventMgr.Instance.on(EventName.StartProgressBarAnim, this.startProgressBarAnim, this);
        // 停止进度条增长动画
        GlEventMgr.Instance.on(EventName.StopProgressBarAnim, this.stopProgressBarAnim, this);

        // -- 增加赢钱
        // GlEventMgr.Instance.on(EventName.AddAmount, this.addAmountUI, this);

        // -- 清空赢钱金币
        GlEventMgr.Instance.on(EventName.ClearWinAmount, this.clearWinLabel, this);

        this.addButtonClick("bottom_bg2/btnAddBet", this, this.clickAddBet);
        this.addButtonClick("bottom_bg2/btnReduceBet", this, this.clickReduceBet);

        this.addButtonClick("btn_info", this, this.showPayInfo);
    }

    onLoad() {
        super.onLoad();

        // 初始化默认值
        if (!this.targetLabel) {
            this.targetLabel = this.view["lb_win"].getComponent(Label);
        }
        // 初始化坐标
        this.m_labelPosition = this.view["lb_win"].position.clone();

        // const uiRoot = this.node; // 所有页面的父节点
        // const visibleSize = view.getVisibleSize();
        // let designW = 768;
        // if (ScreenManager.instance.getCurScreenValue() == true){
        //     //const designW = 768;
        // }else{
        //     designW = 1370;
        // }
        
        // // 计算当前实际可见设计宽度
        // const scaleX = visibleSize.width / designW;
        // uiRoot.scale.set(scaleX, scaleX, 1);

        // // 设置位置
        // let posY = (visibleSize.height - 1370) / 2
        // if (ScreenManager.instance.getCurScreenValue() == true){
            
        // }else{
        //     posY = (visibleSize.height - 768) / 2
        // }
        // uiRoot.setPosition(new Vec3(0,-posY,0));
    }

    start() {
        this.loadDataUI();

        this.view["ProgressBar"].active = false;
    }

    update(deltaTime: number) {}

    // 增加bet
    public clickAddBet(): void {
        let action = LevelMgr.Instance.getLevelModel().getAction();
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
        if (action == ActionType.NORMAL && nextAction == ActionType.NORMAL){
            PlayerMgr.Instance.addBetIndex();
            this.setBetUI();
        }
    }
    // 减少bet
    public clickReduceBet(): void {
        let action = LevelMgr.Instance.getLevelModel().getAction();
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
        if (action == ActionType.NORMAL && nextAction == ActionType.NORMAL){
            PlayerMgr.Instance.reduceBetIndex();
            this.setBetUI();
        }
    }

    private setBetUI(): void {
        const bet = PlayerMgr.Instance.getBet();
        const betLabel = this.view["bottom_bg2/lb_bet"].getComponent(Label);
        if (betLabel) {
            betLabel.string = Utils.util_formatCoins(bet,6);
        }
    }

    /**
     * 销毁时清理
     */
    protected onDestroy(): void {
        // 调用父类onDestroy，处理其他清理工作
        super.onDestroy();
        // 清理动画
        this.stopScroll();
        // 停止scale动画
        this.stopLableScale();
    }

    /**
     * 加载数据到UI 初始化的时候
     */
    private loadDataUI(): void {
        // -- 设置bet
        this.setBetUI();

        // -- 设置赢钱
        const winAmount = LevelMgr.Instance.getLevelModel().getWinAmount();
        this.m_winAmount = winAmount;
        this.setAmountLabel(winAmount);
    }

    private refreshWinUI(scaleAction:boolean):void {
        let winAmount = LevelMgr.Instance.getLevelModel().getWinAmount();
        if (winAmount > this.m_winAmount)
        {
            // 增加金币滚动
            this.startScroll( this.m_winAmount,winAmount,0.5 );
            // label的scaleAction
            if (scaleAction){
                this.labelWinScaleAction();
            }
        }
    }

    /**
     * 设置金额标签
     */
    private setAmountLabel(winAmount: number): void {
        const lbWin = this.view["lb_win"].getComponent(Label);
        if (!lbWin) return;

        if (winAmount > 0) {
            lbWin.string = winAmount.toString();
        } else {
            lbWin.string = "0";
        }
    }

    /**
     * 清空赢钱标签
     */
    private clearWinLabel(): void {
        // 停止动画
        this.stopLableScale();
        this.stopScroll();

        this.m_winAmount = 0;
        this.setAmountLabel(this.m_winAmount);
        this.view["lb_win"].setScale(1, 1, 1);
        this.view["lb_win"].position = this.m_labelPosition;

        this.view["ProgressBar"].active = false;
    }

    // 金币label的动画
    public labelWinScaleAction():void {
        this.stopLableScale();

        const node = this.view["lb_win"];
        this.view["lb_win"].setScale(1, 1, 1);
        let pos = this.m_labelPosition;

        this.m_labelScale = tween(node)
        .to(0.5, { 
            position: new Vec3(pos.x, pos.y + 30, pos.z), 
            scale: new Vec3(2, 2, 2)
        },{ easing: 'sineOut' })
        .delay(0.2)
        // 2. 缩放到1.8
        .to(1, { scale: new Vec3(1.8, 1.8, 1.8) })
        // 缩放到2
        .to(1, { scale: new Vec3(2, 2, 2) })
        // 缩放到1.8
        .to(1, { scale: new Vec3(1.8, 1.8, 1.8) })
        // 缩放到2
        .to(1, { scale: new Vec3(2, 2, 2) })
        // 3. 下移100像素 + 缩放回1倍（同时）
        .to(0.5, {
            position: new Vec3(pos.x, pos.y, pos.z),
            scale: new Vec3(1, 1, 1)
        }, { easing: 'sineIn' })
        .delay(1)
        .union() // 把前面一串动画打包成一个整体
        // 无限循环
        .repeatForever()
        .start();
    }


    // 字体滚动动画
    /**
    * 开始数字滚动动画
    * @param startValue 起始数字
    * @param endValue 结束数字
    * @param duration 动画时长（秒）
    */
    public startScroll(startValue: number, endValue: number, duration: number): void {
        // 安全校验
        if (!this.targetLabel) {
            console.warn('未绑定 Label 组件！');
            return;
        }
        if (duration <= 0) duration = 1;

        // 停止之前的动画，防止冲突
        if (this._tween) {
            this._tween.stop();
        }

        if (startValue == endValue){
            return;
        }

        // 初始化起始值
        this._currentValue = startValue;
        this.targetLabel.string = this._formatNumber(this._currentValue);

        // 创建动画对象
        const animTarget = { value: startValue };
        
        // 执行缓动动画
        this._tween = tween(animTarget)
        .to(duration, { value: endValue }, {
            easing: 'sineOut', // 平滑缓动效果（结尾减速）
            onUpdate: () => {
                // 逐帧更新数字
                this._currentValue = Math.round(animTarget.value);
                this.targetLabel.string = this._formatNumber(this._currentValue);
            }
        })
        .call(() => {
            // 动画结束强制修正为最终值
            this._currentValue = endValue;
            this.m_winAmount = endValue; // 设置
            this.targetLabel.string = this._formatNumber(this._currentValue);
        })
        .start();
    }

    /**
     * 播放进度条增长动画
     * @param from 起始进度 0~1
     * @param to 目标进度 0~1
     * @param duration 动画时长（秒）
     * @param msgType 消息类型
     */
    public startProgressBarAnim( from: number, to: number, duration: number, msgType: string|null ):void {
        const progressBar = this.view["ProgressBar"].getComponent(ProgressBar);
        if (!progressBar) {
            console.warn('未找到 ProgressBar 节点！');
            return;
        }

        // 显示进度条
        this.view["ProgressBar"].active = true;

        // 先设置初始值
        progressBar.progress = from;

        // Tween 动画平滑修改 progress 值
        Tween.stopAllByTarget(progressBar); // 防止重复动画
        tween(progressBar)
            .to(duration, { progress: to }, {
                easing: 'smooth' // 平滑曲线，也可以用 linear 线性
            })
            .start();
    }

    // 停止进度条动画
    public stopProgressBarAnim():void { 
        const progressBar = this.view["ProgressBar"].getComponent(ProgressBar);
        if (progressBar) {
            Tween.stopAllByTarget(progressBar);
            progressBar.progress = 1; // 直接设置为满格
        }

        // 停止数字增长的动画
        this.stopLableScale();
        this.stopScroll();

        // 设置数字
        this.view["lb_win"].setScale(1, 1, 1);
        this.view["lb_win"].position = this.m_labelPosition;
        const winAmount = LevelMgr.Instance.getLevelModel().getWinAmount();
        this.targetLabel.string = this._formatNumber(winAmount);
    }

    /**
     * 格式化数字（整数显示，可自行修改）
     */
    private _formatNumber(num: number): string {
        let coin = Utils.util_formatCoins( num,9 );
        return coin.toString();
    }

    /**
     * 停止动画
     */
    public stopScroll(): void {
        if (this._tween) {
            this._tween.stop();
            this._tween = null;
        }
    }

    /**
     * 停止动画
     */
    public stopLableScale(): void {
        if (this.m_labelScale) {
            this.m_labelScale.stop();
            this.m_labelScale = null;
        }
    }

    public showPayInfo():void{
        GlEventMgr.Instance.emit(EventName.ShowPayInfo);
    }

}