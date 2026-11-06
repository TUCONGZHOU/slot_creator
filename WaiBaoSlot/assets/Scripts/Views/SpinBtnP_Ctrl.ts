import { _decorator, Component, Node, Button, tween } from 'cc';
import { UICtrl, UIMgr } from '../Mgr/UIMgr';
import { EventName } from '../Mgr/EventName';
import { GlEventMgr } from '../Mgr/GlEventMgr';
import { LevelMgr } from '../Mgr/LevelMgr';
import { PlayerMgr } from '../Mgr/PlayerMgr';
import { GetCoin_Ctrl } from "../Views/GetCoin_Ctrl";
import { UILayer } from "../Mgr/UIMgr"

const { ccclass, property } = _decorator;

@ccclass('SpinBtnP_Ctrl')
export class SpinBtnP_Ctrl extends UICtrl {

    private m_handleSpine: boolean = true;
    private m_sendMark: boolean = false;
    private m_stopMark: boolean = false;

    private m_bigWinGrowMark: boolean = false; // 大赢的标志
    private m_msgType: string | null = null; // 消息类型

    private m_delayCallbackTween: ReturnType<typeof tween> | null = null;

    /**
     * 初始化视图 - 在这里进行所有初始化操作
     */
    protected initView(): void {
        // -- 添加消息监听
        // spin数据的回复
        GlEventMgr.Instance.on(EventName.View_LevelSpin_responese, this.responseSpin, this);
        // -- 是否处理spin消息的标志
        GlEventMgr.Instance.on(EventName.View_LevelSpin_handle_mark, this.setHandleMark, this);
        // -- 收到消息 让spinButton设置的点击
        GlEventMgr.Instance.on(EventName.EnabledSpinBtn, this.enabledSpinBtn, this);
        // 收到消息 恢复spin
        GlEventMgr.Instance.on(EventName.RecoverSpinBtn, this.recoverSpin, this);
        // 收到消息 开始spin
        GlEventMgr.Instance.on(EventName.StartSpinBtn, this.sendSpin, this);

        // 收到消息 在进度条增长的时候 显示stop按钮
        GlEventMgr.Instance.on(EventName.StartProgressBarAnim, this.showStopBtn, this);

        // 针对

        // 添加按钮监听
        this.addButtonClick("btn_spin", this, this.sendSpin);
        this.addButtonClick("btn_stop", this, this.btnStop);

        // 默认隐藏停止按钮
        const stopBtn = this.view["btn_stop"];
        if (stopBtn) {
            stopBtn.active = false;
        }
    }

    // 点击spin按钮
    public sendSpin(button: Button): void {
        // 扣除金币
        let hasCoin = PlayerMgr.Instance.getCoin();
        let betCoin = PlayerMgr.Instance.getBet();
        if (hasCoin < betCoin) {
            UIMgr.Instance.showUi("GameMain", "Prefabs/GetCoin", "GetCoin_Ctrl", UILayer.Normal);
            return
        }
        if (this.m_sendMark) {
            return;
        }
        this.m_sendMark = true;
        // 减去金币
        PlayerMgr.Instance.spinReduceCoin();
        // 设置按钮不可点击
        this.view["btn_spin"].getComponent(Button)!.interactable = false;
        // -- 发送消息 开始滚动
        GlEventMgr.Instance.emit(EventName.StartRoll);
        // -- 请求数据
        // LevelMgr.Instance.requestSpin();
    }

    // 点击停止按钮
    public btnStop(button: Button): void {
        // 如果是大赢的标志
        if (this.m_bigWinGrowMark) {
            this.m_bigWinGrowMark = false;
            // 发送消息 继续执行下一步
            if (this.m_msgType == "ExeListFunc") {
                GlEventMgr.Instance.emit(EventName.ExcuteSlotFunction);
            } else if (this.m_msgType == "ShowSpinBtn") {
                // 恢复点击
                GlEventMgr.Instance.emit(EventName.RecoverSpinBtn)
                // 发送消息 清除winAmount显示
                GlEventMgr.Instance.emit(EventName.ClearWinAmount);
                // 发送消息 有些轮盘需要停止大赢动画
                GlEventMgr.Instance.emit(EventName.StopBigWinAction);
            }
            return;
        }


        // 停止动画
        if (this.m_delayCallbackTween) {
            this.m_delayCallbackTween.stop();
            this.m_delayCallbackTween = null;
        }
        // 快停
        this.stopRoll(true);
    }

    // 停止轮盘
    public stopRoll(isQuickStop: boolean): void {
        if (this.m_stopMark) {
            return;
        }
        this.m_stopMark = true;

        // 设置停止按钮不可点击
        const stopBtn = this.view["btn_stop"];
        if (stopBtn) {
            stopBtn.getComponent(Button)!.interactable = false;
        }

        // 发送消息 停止轮盘
        GlEventMgr.Instance.emit(EventName.StopRoll, isQuickStop);
    }

    // 收到了spin消息 显示停止按钮
    public responseSpin(): void {
        // 不处理消息
        if (!this.m_handleSpine) {
            return;
        }
        this.clearUIState();

        const stopBtn = this.view["btn_stop"];
        if (stopBtn) {
            stopBtn.active = true;
            stopBtn.getComponent(Button)!.interactable = true;
        }

        // -- 如果玩家不点击停止 1秒之后停止
        this.m_delayCallbackTween = tween(this.node)
            .delay(1)
            .call(() => {
                this.m_delayCallbackTween = null;
                // 正常停止
                this.stopRoll(false);
            })
            .start();
    }

    // -- 设置是否处理spin消息的标志
    public setHandleMark(mark: boolean): void {
        this.m_handleSpine = mark;
    }

    // 设置spin按钮是否可以点击
    public enabledSpinBtn(enable: boolean): void {
        const spinBtn = this.view["btn_spin"];
        if (spinBtn) {
            spinBtn.getComponent(Button)!.interactable = enable;
        }
    }

    // 恢复spin
    public recoverSpin(): void {
        this.m_sendMark = false;
        this.m_stopMark = false;
        this.clearUIState();

        const spinBtn = this.view["btn_spin"];
        if (spinBtn) {
            spinBtn.active = true;
            spinBtn.getComponent(Button)!.interactable = true;
        }

        const stopBtn = this.view["btn_stop"];
        if (stopBtn) {
            stopBtn.getComponent(Button)!.interactable = false;
        }
    }

    // 显示stop按钮
    /**
     * 播放进度条增长动画
     * @param from 起始进度 0~1
     * @param to 目标进度 0~1
     * @param duration 动画时长（秒）
     * @param msgType 消息类型
     */
    public showStopBtn(from: number, to: number, duration: number, msgType: string | null): void {
        // 标记大赢的标志，后续可以根据这个标志做一些特殊处理
        this.m_bigWinGrowMark = true;
        this.m_msgType = msgType;

        const spinBtn = this.view["btn_spin"];
        if (spinBtn) {
            spinBtn.active = true;
            spinBtn.getComponent(Button)!.interactable = false;
        }

        const stopBtn = this.view["btn_stop"];
        if (stopBtn) {
            stopBtn.active = true;
            stopBtn.getComponent(Button)!.interactable = true;
        }
    }

    public clearUIState(): void {
        const spinBtn = this.view["btn_spin"];
        if (spinBtn) {
            spinBtn.active = false;
        }

        const stopBtn = this.view["btn_stop"];
        if (stopBtn) {
            stopBtn.active = false;
        }
    }

    start() {
        this.m_bigWinGrowMark = false;
    }

    update(deltaTime: number) { }

    /**
     * 销毁时清理 - 注意：事件监听会在父类onDestroy中自动取消
     * 但tween需要单独处理
     */
    protected onDestroy(): void {
        // 停止tween
        if (this.m_delayCallbackTween) {
            this.m_delayCallbackTween.stop();
            this.m_delayCallbackTween = null;
        }

        // 调用父类onDestroy，它会自动取消所有通过addButtonClick添加的事件
        super.onDestroy();
    }
}