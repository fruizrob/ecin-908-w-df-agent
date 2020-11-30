import { useState } from "react";
import Map from "./components/Map";
import { Map as World, Agent } from "./lib";
import "./App.css";

function App() {
  const [world, setWorld] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState(false);
  const [maps, setMaps] = useState([]);
  const [mapIdx, setMapIdx] = useState(0);
  const [agent, setAgent] = useState(false);

  const generateWorld = () => {
    let world = new World(4);
    world.initWorld();
    world.setThreats();
    let agent = new Agent(world, 4);
    setAgent(agent);
    setWorld(world);
    setMapIdx(0);
    setMaps([]);
  };

  const start = () => {
    agent.start(addMap);

    setKnowledgeBase(agent.knowledgeBase);
  };

  const addMap = map => {
    setMaps(maps => [...maps, <Map map={map.cells} agent={true} />]);
  };

  const prevMap = () => {
    if (mapIdx === 0) return;
    setMapIdx(mapIdx - 1);
    return mapIdx;
  };

  const nextMap = () => {
    if (maps.length - 1 === mapIdx) return;
    setMapIdx(mapIdx + 1);
    return mapIdx;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Wumpus World!</h1>
      </header>
      <section style={{ display: "flex" }}>
        <div>
          <button onClick={generateWorld}>Generate map</button>
        </div>
        <div>
          <button onClick={start}>Start!</button>
          <button onClick={prevMap}>Previous</button>
          <button onClick={nextMap}>Next</button>
        </div>
      </section>
      <section style={{ display: "flex" }}>
        {world && <Map map={world.cells} agent={false} />}
        <div>
          <h3>Steps: {maps.length}</h3>
        </div>
        {knowledgeBase && maps[mapIdx]}
      </section>
    </div>
  );
}

export default App;
