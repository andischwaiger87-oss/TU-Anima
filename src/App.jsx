import React, { useState } from 'react';
import Intro from './components/Intro';
import CardSelection from './components/CardSelection';
import ResultEvaluation from './components/ResultEvaluation';
import PreviewStage from './components/PreviewStage';

function App() {
  const [stage, setStage] = useState('intro'); // intro, selection, preview, result
  const [userSelection, setUserSelection] = useState(null);
  const [isSimulation, setIsSimulation] = useState(false);

  const handleStart = () => {
    setStage('selection');
  };

  const handleSelectionComplete = (data) => {
    setUserSelection(data);
    setStage('preview');
  };

  const handleGenerateReal = () => {
    setIsSimulation(false);
    setStage('result');
  };

  const handleSimulate = () => {
    setIsSimulation(true);
    setStage('result');
  };

  return (
    <main style={{ width: '100%', minHeight: '100vh', position: 'relative' }}>
      {stage === 'intro' && <Intro onStart={handleStart} />}
      {stage === 'selection' && <CardSelection onComplete={handleSelectionComplete} />}
      {stage === 'preview' && (
        <PreviewStage
          selectionData={userSelection}
          onGenerate={handleGenerateReal}
          onSimulate={handleSimulate}
        />
      )}
      {stage === 'result' && (
        <ResultEvaluation
          selectionData={userSelection}
          isSimulation={isSimulation}
        />
      )}
    </main>
  );
}

export default App;
