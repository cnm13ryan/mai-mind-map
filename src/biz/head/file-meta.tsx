import { useAtom } from "@root/base/atom";
import { css } from "@root/base/styled";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Popup from "../components/popup";
import SkeletonBlock from "../components/skeleton-block";
import { filesAtom } from "../store";

const SBox = css`
  display: flex;
  flex-direction: column;
`;
const STop = css`
  display: flex;
  align-items: center;
`;
const STitle = css`
  padding: 2px;
  border-radius: 2px;
  cursor: pointer;
  font-size: 13px;
  &:hover {
    background-color: #ccc;
  }
`;

const SLastEdit = css`
  font-size: 11px;
  color: #999999;
`;

const SRename = css`
  padding: 12px;
  &>input {
    border: 1px solid #ccc;
    border-radius: 2px;
    padding: 4px 6px;
    min-width: 200px;
    &:focus {
      outline: none;
      box-shadow: rgba(0, 106, 254, 0.12) 0px 0px 0px 2px;
      border-color: rgba(63,133,255,1);
    }
  }
`;

function Rename(props: {
  position: [x: number, y: number];
  title: string;
  commit: (title: string) => void;
  hide: () => void;
}) {
  const { position: [left, top], title, commit, hide } = props;
  const [text, edit] = useState(title);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <Popup hide={hide} position={{ left, top }}>
      <div className={SRename}>
        <input
          value={text}
          ref={ref}
          onChange={e => edit(e.target.value)}
          onBlur={() => {
            if (text === title) return;
            commit(text);
          }}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            (e.target as HTMLInputElement).blur();
          }}
        />
      </div>
    </Popup>
  );
}

export function FileMeta() {
  const [popup, setPopup] = useState<[number, number] | null>(null);
  const hide = useCallback(() => setPopup(null), []);

  const id = useParams().fileId || '';
  const [{ files, loading }, , actions] = useAtom(filesAtom);
  const file = files.find(f => f.id === id);

  if (loading || !file) {
    return (
      <div className={SBox} style={{ gap: 4 }}>
        <SkeletonBlock style={{ width: 100 }} />
        <SkeletonBlock style={{ width: 150 }} />
      </div>
    );
  }

  const title = file.title || 'Untitled';
  return (
    <div className={SBox}>
      <div className={STop}>
        <div
          className={STitle}
          onClick={(ev) => {
            const rect = (ev.target as HTMLElement).getBoundingClientRect();
            setPopup([rect.left, rect.bottom]);
          }}
        >{title}</div>
      </div>
      {popup && (
        <Rename
          position={popup}
          title={title}
          commit={(result) => {
            // todo: update by server api
            actions.update(id, { title: result });
          }}
          hide={hide}
        />
      )}
      <div className={SLastEdit}>
        Last edit: {(new Date(file.updated)).toLocaleString()}
      </div>
    </div>
  );
}
