import { GROUPS } from '../data/topics.js'
import { GROUP_NAME_MAX } from '../lib/state.js'

// 모둠 정하기: 번호(1~8조)로 고르거나, 모둠 이름을 직접 써요
export default function GroupPicker({ state, dispatch }) {
  const byName = state.groupMode === 'name'
  return (
    <div className="group-picker">
      <div className="seg-toggle" role="tablist" aria-label="모둠 정하는 방법">
        <button
          role="tab"
          aria-selected={!byName}
          className={`seg ${!byName ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'setGroupMode', mode: 'number' })}
        >
          🔢 번호로 고르기
        </button>
        <button
          role="tab"
          aria-selected={byName}
          className={`seg ${byName ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'setGroupMode', mode: 'name' })}
        >
          🏷️ 모둠 이름 쓰기
        </button>
      </div>
      {byName ? (
        <label className="field group-name-field">
          <span className="field-label">우리 모둠 이름을 써 보세요.</span>
          <input
            className="input input-lg"
            value={state.groupName}
            maxLength={GROUP_NAME_MAX}
            placeholder="예) 햇살 모둠"
            onChange={(e) => dispatch({ type: 'setGroupName', text: e.target.value })}
          />
          <span className="counter">
            {state.groupName.length}/{GROUP_NAME_MAX}
          </span>
        </label>
      ) : (
        <div className="group-grid" role="radiogroup" aria-label="모둠 선택">
          {GROUPS.map((g) => (
            <button
              key={g}
              role="radio"
              aria-checked={state.group === g}
              className={`chip chip-group ${state.group === g ? 'selected' : ''}`}
              onClick={() => dispatch({ type: 'setGroup', group: g })}
            >
              {g}조
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
