const { createApp, ref } = Vue;
// Vuetify を取り出し
const { createVuetify } = Vuetify;
// Vuetify を作ってプラグイン登録する
const vuetify = createVuetify();
    // apiキーとエンドポイントを定義
const apikey = "AIzaSyC741iyic4rtAXCBCWJV2eg87gOgnPGReQ"     // apiキー
const endpoint ='https://language.googleapis.com/v2/documents:analyzeSentiment';      // エンドポイント
createApp({
  setup: function () {
    // Vue内部で使いたい変数は全て ref で定義する
    const inputtext = ref('');          // 文章を保持する
//  const history = ref([]);          // 履歴一覧（配列）
		const score   = ref(0);           // ネガポジ
		const magnitude = ref(0);         // 感情の強さ
    const message = ref('')         // メッセージ
    // 関数はここ
    function enterText() {
      console.log('次の文章が入力されました：', inputtext.value);
    // リクエスト定義
      const request = {
        document:{
          type:"PLAIN_TEXT",
          content:inputtext.value
          },
        encodingType:"UTF8"
      }
			callAPI(request);
    // 配列の先頭に入力した文章を追加する（最後尾の場合は push）
    //history.value.unshift(inputtext.value);
	  }			
    // API呼び出し
		function callAPI(request) {
		  return new Promise((resolve, reject) => {
			  axios.post (`${endpoint}?key=${apikey}`,request)
			    .then((response) => {
			    resolve(response);			
		      })
			    .catch((error) => {
			    reject(error);
		      });
			})
		// 呼び出しに成功
		  .then((response) => {
				score.value = response.data.documentSentiment.score;
      	magnitude.value = response.data.documentSentiment.magnitude;
      	console.log(`スコア=${score.value}, マグニチュード=${magnitude.value}`);
		// 結果に応じたメッセージを表示
				if (score.value > 0.25) {
          if (magnitude.value > 1.0) {
            message.value = 'とてもポジティブな文章です！！';
          } else {
            message.value = 'ややポジティブな文章です！';
          }
        } else if (score.value < -0.25) {
          if (magnitude.value > 1.0) {
            message.value = 'とてもネガティブな文章です……';
          } else {
            message.value = 'ややネガティブな文章です…';
          }
        } else {
            message.value = 'ニュートラルな文章です。';
        }
		// 散布図に表示させるため結果（x（score）,y（magnitude））を受け渡す
			  myScatterChart.data.datasets[0].data = []
				myScatterChart.data.datasets[0].data.push({
        x: score.value,
        y: magnitude.value
      });
      myScatterChart.update();	
			})
		// 呼び出しに失敗
    	.catch((error) =>  {
        if (error.response) {
          console.error("HTTPステータス:", error.response.status);
          console.error("レスポンスデータ:", error.response.data);
        } else if (error.request) {
          console.error("レスポンスなし", error.message);
        } else {
          console.error("設定エラー:", error.message);
        }
          console.log("API呼び出しでエラーになりました");
      });

		}
    // 全ての履歴を消去する
 //   function clearAll() {
 //     history.value = []; // 配列を空にする
 //     console.log('全ての履歴を削除しました');
 //   }
    // HTML から使いたい変数や関数を reurn で返す、clearAllも追加
    return { inputtext, enterText,message };
  }
}).use(vuetify)          // Vuetify を使う宣言
.mount('#app');        // Vue が管理するDOM