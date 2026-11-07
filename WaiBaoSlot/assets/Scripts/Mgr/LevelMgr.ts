import { _decorator, Component, Node, resources, JsonAsset, assert, native, sys } from 'cc';
const { ccclass, property } = _decorator;

import { BaseGameModel } from '../GameBase/BaseGameModel';
import { LevelTR_GameModel } from '../Levels/LevelTR/LevelTR_GameModel';
import { LevelJT_GameModel } from '../Levels/LevelJT/LevelJT_GameModel';
import { LevelConfig } from '../InterFace/LevelConfig';
import { PlayerMgr } from './PlayerMgr';
import { CKGameCenter } from './CKGameCenter';

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

    // 每次切换场景进入关卡时重置一下数据，避免test数据错乱引起的报错
    public resetLevelTestValue() {
        this.m_levelConfig = {} as LevelConfig;
        this.m_gameMode = null;
        this.m_levelId = -1;
        this.m_testSpinJsonData = [];
        this.m_testSpinIndex = 0;
        this.m_testNowSpinIndex = 0;
    }

    start() {
        console.log('哪里执行了LevelMgr.ts 脚本???');

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

    // 加载测试的spin数据
    public loadTestSpinData(spinJsonPath: string[], endFunc: Function): void {
        if (this.m_testSpinIndex < spinJsonPath.length) {
            let path = spinJsonPath[this.m_testSpinIndex];
            resources.load(path, JsonAsset, (err, jsonAsset: JsonAsset) => {
                if (err) {
                    console.error('加载JSON失败:', err);
                    return;
                }
                const jsonData = jsonAsset.json;
                this.m_testSpinJsonData.push(jsonData);
                this.m_testSpinIndex = this.m_testSpinIndex + 1;
                // 递归调用
                this.loadTestSpinData(spinJsonPath, endFunc);
            });
        } else {
            console.log("===============> 加载所有的测试json完毕 ")
            if (endFunc) {
                endFunc()
            }
        }
    }

    // -- 请求进入关卡的数据
    public requestEnterGame(levelId: number, levelName: string, callFunc: Function): void {
        console.log('请求进入关卡的数据======requestEnterGame')
        // 发送请求 目前这里用读取json的方式来模拟 <这里是模拟>
        let jsonPath = levelName + "/default";
        // let jsonPath = levelName + "/1";
        this.m_levelId = levelId;
        resources.load(jsonPath, JsonAsset, (err, jsonAsset: JsonAsset) => {
            if (err) {
                console.error('加载JSON失败:', err);
                return;
            }

            // 解析数据
            const jsonData = jsonAsset.json;
            this.m_gameMode.parseEnterGameData(jsonData);

            if (callFunc) {
                callFunc();
            }
        });

        // TODO 真实环境是请求服务器的数据
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

    public responseSpin(): void {
        let data = this.m_testSpinJsonData[this.m_testNowSpinIndex];
        this.m_testNowSpinIndex = this.m_testNowSpinIndex + 1;
        console.log("===============> 当前第%d个Spin数据 ", this.m_testNowSpinIndex)
        if (this.m_testNowSpinIndex >= this.m_testSpinJsonData.length) {
            this.m_testNowSpinIndex = 0;
        }
        this.m_gameMode.parseSpinData(data);

        // let data = CKGameCenter.Instance.calResultData();
        // // console.log("===============> 模拟服务器返回的数据 ",data)
        // // console.log("---------> 模拟服务器返回的数据",JSON.stringify(data, null, 2));
        // this.m_gameMode.parseSpinData( data );
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
        if (levelName == "LevelTR") {
            return new LevelTR_GameModel();
        }
        else if (levelName == "LevelJT") {
            return new LevelJT_GameModel();
        }
        else {
            console.warn("[LevelMgr] 未知关卡:", levelName);
            return new BaseGameModel();
        }
    }
}


