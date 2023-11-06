import '!./output.css';
import { Container, render, useWindowResize, TabsOption } from '@create-figma-plugin/ui';
import { emit, on } from '@create-figma-plugin/utilities';
import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import {
  ResizeWindowHandler,
  UpdatePageDataHandler,
  PropertyTypeValues,
  PropertyType,
  GetVariablesHandler,
  GetVariableCollectionsHandler,
  IVariable,
  IVariableCollection,
  ETabs,
} from './types';
import TabInspect from './components/Tabs/TabInspect';
import TabBar from './components/Tabs/TabBar';
import TabAutoFix from './components/Tabs/TabAutoFix';

function Plugin() {
  const [pageData, setPageData] = useState<PropertyTypeValues | null>(null);
  const [variables, setVariables] = useState<IVariable[]>([]);
  const [keyUsageCounts, setKeyUsageCounts] = useState<{ [key: string]: number }>({});
  const [variableCollections, setVariableCollections] = useState<IVariableCollection[]>([]);

  // const [propertyVisibility, setPropertyVisibility] = useState(
  //   Object.fromEntries(Object.values(PropertyType).map((type) => [type, true]))
  // );

  const [activeTab, setActiveTab] = useState<ETabs>(ETabs.INSPECT);

  function onWindowResize(windowSize: { width: number; height: number }) {
    emit<ResizeWindowHandler>('RESIZE_WINDOW', windowSize);
  }
  useWindowResize(onWindowResize, {
    maxHeight: 720,
    maxWidth: 720,
    minHeight: 320,
    minWidth: 320,
    resizeBehaviorOnDoubleClick: 'minimize',
  });

  useEffect(() => {
    function handleUpdatePageData(properties: PropertyTypeValues) {
      setPageData(properties);
      countKeyUsage(properties);
    }

    on<UpdatePageDataHandler>('UPDATE_PAGE_DATA', handleUpdatePageData);
    on<GetVariablesHandler>('GET_VARIABLES', (data) => setVariables(data));
    on<GetVariableCollectionsHandler>('GET_VARIABLE_COLLECTIONS', (data) =>
      setVariableCollections(data)
    );
  }, []);

  const countKeyUsage = (data: PropertyTypeValues) => {
    const keyCounts: { [key: string]: number } = {};
    Object.entries(data).forEach(([key, value]) => {
      let count = 0;
      Object.values(PropertyType).forEach((type) => {
        Object.values(value[type]).forEach((propertyValue) => {
          count += propertyValue.count;
        });
      });
      keyCounts[key] = (keyCounts[key] || 0) + count;
    });
    setKeyUsageCounts(keyCounts);
  };

  return (
    <Container space="medium">
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="mt-16">
        {activeTab === ETabs.INSPECT && (
          <TabInspect
            pageData={pageData}
            keyUsageCounts={keyUsageCounts}
            variableCollections={variableCollections}
            variables={variables}
          />
        )}
        {activeTab === ETabs.AUTOFIX && <TabAutoFix pageData={pageData} variables={variables} />}
      </div>
    </Container>
  );
}

export default render(Plugin);
