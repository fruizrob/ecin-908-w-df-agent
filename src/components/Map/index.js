import "./styles.css";

export default function Map(props) {
  const cells = props.map;

  const logMap = () => {
    console.log({ cells });
  };

  if (props.agent) {
    return (
      <div className="map-container">
        {cells.map((row, i) => (
          <div key={i}>
            {row.map((cell, j) => {
              let state = [];

              for (const [key, value] of Object.entries(cell.state)) {
                if (value)
                  state.push(<p key={`${i}-${j}-${key}-${value}`}>{key}</p>);
              }

              return (
                <div key={`${i}-${j}`} className="cell-container">
                  <p style={{ margin: "0.5em" }}>
                    {cell.value !== "_" && <b>{cell.value}</b>}
                  </p>
                  {state}
                </div>
              );
            })}
          </div>
        ))}
        <button onClick={logMap}>log</button>
      </div>
    );
  } else {
    return (
      <div className="map-container">
        {cells.map((row, i) => (
          <div key={i}>
            {row.map((cell, j) => {
              let state = [];

              for (const [key, value] of Object.entries(cell.state)) {
                if (value)
                  state.push(<p key={`${i}-${j}-${key}-${value}`}>{key}</p>);
              }

              return (
                <div key={`${i}-${j}`} className="cell-container">
                  <p style={{ margin: "0.5em" }}>
                    {cell.value !== "_" && <b>{cell.value}</b>}
                  </p>
                  {state}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }
}
