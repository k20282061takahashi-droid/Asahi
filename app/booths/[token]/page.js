"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function BoothPage() {
  const params = useParams();
  const token = params.token; // URLの中の "a8f3k2x9" のような文字列

  const [loading, setLoading] = useState(true); // 読み込み中かどうか
  const [notFound, setNotFound] = useState(false); // 該当する企画が見つからなかったか
  const [docId, setDocId] = useState(null); // 見つかった企画のドキュメントID（例: "class_1a"）
  const [saving, setSaving] = useState(false); // 保存処理中かどうか
  const [saveDone, setSaveDone] = useState(false); // 保存が完了したかどうか

  // 入力欄の値をまとめて管理する
  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    floor: "",
    hasWaiting: false,
    timePerGroup: "",
  });

  // ページが開かれたら、まず自分の企画データをFirestoreから探してくる
  useEffect(() => {
    async function fetchBooth() {
      try {
        // "booths" コレクションの中から、accessToken が token と一致するものを探す
        const boothsRef = collection(db, "booths");
        const q = query(boothsRef, where("accessToken", "==", token));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          // 一致する企画が見つからなかった場合（URLが間違っている等）
          setNotFound(true);
          setLoading(false);
          return;
        }

        // 見つかった1件のデータを取り出す
        const boothDoc = snapshot.docs[0];
        const data = boothDoc.data();

        setDocId(boothDoc.id);
        setForm({
          name: data.name || "",
          description: data.description || "",
          location: data.location || "",
          floor: data.floor != null ? String(data.floor) : "",
          hasWaiting: data.hasWaiting || false,
          timePerGroup: data.timePerGroup != null ? String(data.timePerGroup) : "",
        });
        setLoading(false);
      } catch (error) {
        console.error("データの取得に失敗しました:", error);
        setNotFound(true);
        setLoading(false);
      }
    }

    if (token) {
      fetchBooth();
    }
  }, [token]);

  // 入力欄が変更されたときに、formの中身を更新する共通関数
  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // 保存ボタンが押されたときの処理
  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaveDone(false);

    try {
      const boothRef = doc(db, "booths", docId);
      await updateDoc(boothRef, {
        name: form.name,
        description: form.description,
        location: form.location,
        floor: Number(form.floor),
        timePerGroup: form.hasWaiting ? Number(form.timePerGroup) : null,
        isSetupDone: true,
      });
      setSaveDone(true);
    } catch (error) {
      console.error("保存に失敗しました:", error);
      alert("保存に失敗しました。もう一度お試しください。");
    } finally {
      setSaving(false);
    }
  }

  // ----- 画面表示部分 -----

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">企画情報が見つかりませんでした</h1>
          <p className="text-gray-600">
            URLが正しいかご確認ください。ご不明な場合は運営までお問い合わせください。
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-1">渦潮祭 企画情報入力</h1>
      <p className="text-sm text-gray-500 mb-6">
        企画名・詳細・場所などを入力してください
      </p>

      <form onSubmit={handleSave} className="space-y-5">
        {/* 企画名 */}
        <div>
          <label className="block text-sm font-medium mb-1">企画名</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            placeholder="例: お化け屋敷"
          />
        </div>

        {/* 詳細説明 */}
        <div>
          <label className="block text-sm font-medium mb-1">詳細説明</label>
          <textarea
            required
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            rows={4}
            placeholder="企画の内容を来場者にわかりやすく説明してください"
          />
        </div>

        {/* 場所 */}
        <div>
          <label className="block text-sm font-medium mb-1">場所</label>
          <input
            type="text"
            required
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            placeholder="例: 1-D教室、体育館前、中庭 など"
          />
        </div>

        {/* 階数 */}
        <div>
          <label className="block text-sm font-medium mb-1">何階か</label>
          <input
            type="number"
            required
            value={form.floor}
            onChange={(e) => handleChange("floor", e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            placeholder="例: 1"
          />
        </div>

        {/* 1グループあたりの所要時間（待ちグループの仕組みを使う企画のみ表示） */}
        {form.hasWaiting && (
          <div>
            <label className="block text-sm font-medium mb-1">
              1グループあたりの所要時間（分）
            </label>
            <input
              type="number"
              required
              value={form.timePerGroup}
              onChange={(e) => handleChange("timePerGroup", e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              placeholder="例: 5"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white rounded-md py-3 font-medium disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存する"}
        </button>

        {saveDone && (
          <p className="text-green-600 text-sm text-center">
            保存しました！内容はいつでもこのページから変更できます。
          </p>
        )}
      </form>
    </main>
  );
}