import { mat4, vec3 } from "gl-matrix";
import { isEqual, mapKeys } from "lodash";
import * as React from "react";
import AMapContext from "../AMapContext";
import { IAMap, Map, Mesh, Object3DLayer } from "../types";
import get from "../utils/get";

interface MeshDrawArgs {
  [key: string]: any | { value: any, equal(v1: any, v2: any): boolean };
}

interface DrawResult {
  vertices: number[];
  vertexColors?: number[];
  faces?: number[];
}

interface IMeshProps {
  args?: MeshDrawArgs;
  translation?: [number, number, number];
  rotation?: [number, number, number, number];
  draw(args?: MeshDrawArgs): DrawResult;
}

class MeshComponent extends React.Component<IMeshProps> {
  public map: Map;
  public object3Dlayer: Object3DLayer;
  public mesh: Mesh;

  constructor(props: IMeshProps, context: Map) {
    super(props);

    const AMap: IAMap = ( window as any).AMap;
    this.map = context;
    this.object3Dlayer = new AMap.Object3DLayer({
      map: this.map,
    });

    this.initMesh();
  }

  public componentWillUnmount() {
    this.object3Dlayer.clear();
    this.map.remove(this.object3Dlayer);
  }

  public componentWillReceiveProps(nextProps: IMeshProps) {
    const newKeys = mapKeys(nextProps.args);
    const oldKeys = mapKeys(this.props.args);

    if (newKeys.length !== oldKeys) {
      this.redrawMesh(nextProps);
      return;
    }

    for (let i = 0, key, value, equal; i < newKeys.length; i += 1) {
      key = newKeys[i];
      value = get(nextProps.args, key);

      equal = get(value, "equal") ? value.equal : isEqual;

      if (!equal(value, get(this.props.args, key))) {
        this.redrawMesh(nextProps);
        return;
      }
    }

    if (
      get(nextProps, "translation[0]") !== get(this.props, "translation[0]") ||
      get(nextProps, "translation[1]") !== get(this.props, "translation[1]") ||
      get(nextProps, "translation[2]") !== get(this.props, "translation[2]")
    ) {
      this.redrawMesh(nextProps);
      return;
    }

    if (
      get(nextProps, "rotation[0]") !== get(this.props, "rotation[0]") ||
      get(nextProps, "rotation[1]") !== get(this.props, "rotation[1]") ||
      get(nextProps, "rotation[2]") !== get(this.props, "rotation[2]")
    ) {
      this.redrawMesh(nextProps);
      return;
    }
  }

  public transform = (vertices: number[], props: IMeshProps) => {
    const matrix = mat4.create();
    let needTransform = false;

    if (props.rotation) {
      needTransform = true;
      const [angle, x, y, z] = props.rotation;
      mat4.fromRotation(matrix, angle, [x, y, z]);
    }

    if (props.translation) {
      needTransform = true;
      const pixel = this.map.lngLatToGeodeticCoord([props.translation[0], props.translation[1]]);
      matrix[12] = pixel.x;
      matrix[13] = pixel.y;
      matrix[14] = props.translation[2];
    }

    if (needTransform) {
      const resultVectices = [];
      const tempVec3 = vec3.create();
      for (let i = 0; i < vertices.length; i += 3) {
        vec3.transformMat4(tempVec3, [vertices[i], vertices[i + 1], vertices[i + 2]], matrix);
        resultVectices.push(...tempVec3);
      }

      return resultVectices;
    }

    return vertices;
  }

  public initMesh = () => {
    const AMap: IAMap = ( window as any).AMap;
    this.mesh = new AMap.Object3D.Mesh();
    this.mesh.transparent = true;

    const {
      draw,
      args,
    } = this.props;

    const { vertices: v, vertexColors, faces } = draw(args);
    const vertices = this.transform(v, this.props);

    for (let i = 0; i < vertices.length; i += 1) {
      this.mesh.geometry.vertices.push(vertices[i]);
    }
    if (vertexColors) {
      for (let i = 0; i < vertexColors.length; i += 1) {
        this.mesh.geometry.vertexColors.push(vertexColors[i]);
      }
    }
    if (faces) {
      for (let i = 0; i < faces.length; i += 1) {
        this.mesh.geometry.faces.push(faces[i]);
      }
    }

    this.object3Dlayer.add(this.mesh);
  }

  public redrawMesh = (props: IMeshProps) => {
    const {
      draw,
      args,
    } = props;

    const { vertices: v, vertexColors, faces } = draw(args);
    const vertices = this.transform(v, props);

    if (
      vertices.length === this.mesh.geometry.vertices.length ||
      (vertexColors && vertexColors.length === this.mesh.geometry.vertexColors.length) ||
      (faces && faces.length === this.mesh.geometry.faces.length)
    ) {
      for (let i = 0; i < vertices.length; i += 1) {
        this.mesh.geometry.vertices[i] = vertices[i];
      }
      if (vertexColors) {
        for (let i = 0; i < vertexColors.length; i += 1) {
          this.mesh.geometry.vertexColors[i] = vertexColors[i];
        }
      }
      if (faces) {
        for (let i = 0; i < faces.length; i += 1) {
          this.mesh.geometry.faces[i] = faces[i];
        }
      }

      this.mesh.needUpdate = true;
      this.mesh.reDraw();
    } else {
      this.object3Dlayer.remove(this.mesh);
      this.mesh = new ( window as any).AMap.Object3D.Mesh();
      this.mesh.transparent = true;

      for (let i = 0; i < vertices.length; i += 1) {
        this.mesh.geometry.vertices.push(vertices[i]);
      }

      if (vertexColors) {
        for (let i = 0; i < vertexColors.length; i += 1) {
          this.mesh.geometry.vertexColors.push(vertexColors[i]);
        }
      }

      if (faces) {
        for (let i = 0; i < faces.length; i += 1) {
          this.mesh.geometry.faces.push(faces[i]);
        }
      }

      this.object3Dlayer.add(this.mesh);
      this.object3Dlayer.reDraw();
    }
  }

  public render() {
    return null;
  }
}

MeshComponent.contextType = AMapContext;

export default MeshComponent;
