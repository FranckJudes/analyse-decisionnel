declare module 'bpmn-js/lib/Modeler' {
  export default class Modeler {
    constructor(options?: any);
    createDiagram(): Promise<void> | void;
    importXML(xml: string): Promise<any>;
    saveXML(options?: { format?: boolean }): Promise<{ xml: string }>;
    saveSVG(): Promise<{ svg: string }>;
    get(service: string): any;
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback: (...args: any[]) => void): void;
    destroy(): void;
  }
}
