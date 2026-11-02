import { _decorator, Component, Node, assert, native, sys } from 'cc';
const { ccclass, property } = _decorator;

import { BaseGameModel } from '../GameBase/BaseGameModel';
import { LevelTR_GameModel } from '../Levels/LevelTR/LevelTR_GameModel';
import { LevelConfig } from '../InterFace/LevelConfig';
import { PlayerMgr } from './PlayerMgr';
import { CKGameCenter } from './CKGameCenter';
import { LevelTR_DEFAULT_DATA, createRandomSpinData } from '../Levels/LevelTR/LevelTR_MockData';

@ccclass('LevelMgr') // 关卡的Manager 用于请求数据
export class LevelMgr extends Component {

    public static Instance: LevelMgr = null;

    private m_levelConfig: LevelConfig = {} as LevelConfig;
    private m_gameMode: BaseGameModel = null;
    private m_levelId: number = -1;

    private m_testSpinJsonData: Record<string, any>[] = [];

    // 本地代码测试相关
    private m_testSpinIndex: number = 0;
    private m_testNowSpinIndex: number = 0;

    protected onLoad(): void {
        if (LevelMgr.Instance === null) {
            LevelMgr.Instance = this;
        }
        else {
            this.destroy();
            return;
        }
    }

    start() {

    }

    update(deltaTime: number) {

    }

    // 解析关卡的配置数据
    public setLevelConfigAndModel(levelConfig: LevelConfig) {
        this.m_levelConfig = levelConfig;
        // 创建model
        this.m_gameMode = this.crearteGameMode(this.m_levelConfig.BundleName);
        this.m_gameMode.setLevelConfig(levelConfig);
    }

    // 加载测试的spin数据（已改为每次随机生成，无需预加载）
    public loadTestSpinData(spinJsonPath: string[], endFunc: Function): void {
        console.log("===============> 测试数据改为随机生成模式");
        if (endFunc) {
            endFunc();
        }
    }

    // -- 请求进入关卡的数据
    public requestEnterGame(levelId: number, levelName: string, callFunc: Function): void {
        this.m_levelId = levelId;
        // 已改为代码内置的 mock 数据
        this.m_gameMode.parseEnterGameData(LevelTR_DEFAULT_DATA);
        if (callFunc) {
            callFunc();
        }
    }

    // -- spin请求
    public requestSpin(): void {
        let levelId = this.m_levelId;
        let userId = PlayerMgr.Instance.getUserId();

        // TODO发送请求

        // -- TEST 这里直接调用 模拟1秒后服务器数据返回
        this.scheduleOnce(() => {
            this.responseSpin();
        }, 0.5);
    }

    // public responseSpin(): void {
    //     let data = this.m_testSpinJsonData[this.m_testNowSpinIndex];
    //     this.m_testNowSpinIndex = this.m_testNowSpinIndex + 1;
    //     console.log("===============> 当前第%d个Spin数据 ", this.m_testNowSpinIndex)
    //     if (this.m_testNowSpinIndex >= this.m_testSpinJsonData.length) {
    //         this.m_testNowSpinIndex = 0;
    //     }
    //     this.m_gameMode.parseSpinData(data);

    //     // let data = CKGameCenter.Instance.calResultData();
    //     // // console.log("===============> 模拟服务器返回的数据 ",data)
    //     // // console.log("---------> 模拟服务器返回的数据",JSON.stringify(data, null, 2));
    //     // this.m_gameMode.parseSpinData( data );
    // }
    public responseSpin(): void {
        // 每次旋转随机生成盘面，不再依赖固定测试序列
        let data = createRandomSpinData();
        this.m_testNowSpinIndex = this.m_testNowSpinIndex + 1;
        console.log("===============> 当前第%d个Spin数据 ", this.m_testNowSpinIndex)

        // ↓↓↓ 新增：打印盘面
        console.log(
            `[Spin ${this.m_testNowSpinIndex}] ${data.action} 赢分:${data.winAmount} 下注:${data.bet}`
        );
        console.log(data.reels, 'reels(原始：每列 下→上)');
        // -- 按屏幕从上往下输出 便于和画面核对
        data.reels.forEach((table: number[][], tableIndex: number) => {
            const topToBottom = table.map((col: number[]) => col.slice().reverse());
            console.log(`  轮盘${tableIndex} 屏幕上→下: ${JSON.stringify(topToBottom)}`);
        });

        // console.table(
        //     data.reels[0].map((col: number[], ci: number) => ({
        //         列: ci,
        //         第1个: col[0],
        //         第2个: col[1],
        //         第3个: col[2]
        //     }))
        // );
        console.log("中奖线:", JSON.stringify(data.lines));
        // ↑↑↑ 新增结束

        this.m_gameMode.parseSpinData(data);
    }



    public initGameModel(levelConfig: LevelConfig): void {
        this.m_levelConfig = levelConfig;
        // 创建model
        this.m_gameMode = this.crearteGameMode(this.m_levelConfig.BundleName);
        this.m_gameMode.setLevelConfig(levelConfig);
    }

    public getLevelConfig(): LevelConfig {
        return this.m_levelConfig
    }

    public getLevelModel(): BaseGameModel {
        return this.m_gameMode;
    }

    public getSymbolConfig(symbolId: number) {
        for (const config of this.m_levelConfig.Symbol) {
            if (config.id == symbolId) {
                return config;
            }
        }
        assert(false, " !! 没有找到配置 id = " + symbolId + " !! ");
    }

    private crearteGameMode(levelName: string): BaseGameModel {
        // 只保留 LevelTR
        return new LevelTR_GameModel();
    }
}


