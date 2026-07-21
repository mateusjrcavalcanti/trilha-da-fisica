import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Group, MathUtils, Mesh, Vector3 } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { Vector3Tuple } from "./board";
import type { RobotAction, RobotExpression } from "./types";

type RobotPieceProps = {
  modelPath: string;
  targetPosition: Vector3Tuple;
  path: Vector3Tuple[];
  accentColor: string;
  action: RobotAction;
  expression: RobotExpression;
  facingYaw: number;
  resetToken: number;
  onPositionChange?: (position: Vector3Tuple) => void;
  onArrive?: () => void;
};

const LOOPING_ACTIONS = new Set<RobotAction>(["Idle", "Walking", "Running", "WalkJump", "Dance"]);
const MOVEMENT_ACTIONS = new Set<RobotAction>(["Walking", "Running", "WalkJump"]);
const EXPRESSIONS = ["Angry", "Surprised", "Sad"] as const;

function stepToward(current: number, target: number, speed: number) {
  const distance = target - current;
  if (Math.abs(distance) <= speed) return target;
  return current + Math.sign(distance) * speed;
}

export function RobotPiece({
  modelPath,
  targetPosition,
  path,
  accentColor,
  action,
  expression,
  facingYaw = 0,
  resetToken,
  onPositionChange,
  onArrive,
}: RobotPieceProps) {
  const group = useRef<Group>(null);
  const mountedPosition = useRef<Vector3Tuple>(targetPosition);
  const hasArrived = useRef(false);
  const waypointIndex = useRef(0);
  const latestTargetPosition = useRef(targetPosition);
  const latestFacingYaw = useRef(facingYaw);
  const latestOnPositionChange = useRef(onPositionChange);
  const latestOnArrive = useRef(onArrive);
  const waypoints = useMemo(
    () => (path.length ? path : [targetPosition]).map((position) => new Vector3(...position)),
    [path, targetPosition],
  );
  const { scene, animations } = useGLTF(modelPath);
  const clonedScene = useMemo(() => clone(scene), [scene]);
  const { actions } = useAnimations(animations, clonedScene);

  useEffect(() => {
    latestTargetPosition.current = targetPosition;
  }, [targetPosition]);

  useEffect(() => {
    latestFacingYaw.current = facingYaw;
  }, [facingYaw]);

  useEffect(() => {
    latestOnPositionChange.current = onPositionChange;
  }, [onPositionChange]);

  useEffect(() => {
    latestOnArrive.current = onArrive;
  }, [onArrive]);

  useEffect(() => {
    if (!group.current) return;
    group.current.position.set(...latestTargetPosition.current);
    group.current.rotation.y = latestFacingYaw.current;
    latestOnPositionChange.current?.(latestTargetPosition.current);
    hasArrived.current = false;
  }, [resetToken]);

  useEffect(() => {
    if (!group.current || MOVEMENT_ACTIONS.has(action)) return;
    group.current.rotation.y = facingYaw;
  }, [action, facingYaw]);

  useEffect(() => {
    hasArrived.current = false;
    waypointIndex.current = 0;
  }, [targetPosition]);

  useEffect(() => {
    hasArrived.current = false;
    waypointIndex.current = 0;
  }, [path]);

  useEffect(() => {
    Object.values(actions).forEach((clip) => clip?.stop());
    const currentAction = actions[action];
    if (!currentAction) return;

    currentAction.reset();
    currentAction.clampWhenFinished = !LOOPING_ACTIONS.has(action);
    currentAction.repetitions = LOOPING_ACTIONS.has(action) ? Infinity : 1;
    currentAction.play();
  }, [action, actions]);

  useEffect(() => {
    clonedScene.traverse((object) => {
      if (!(object instanceof Mesh) || !object.morphTargetDictionary || !object.morphTargetInfluences) return;

      EXPRESSIONS.forEach((target) => {
        const index = object.morphTargetDictionary?.[target];
        if (index === undefined || !object.morphTargetInfluences) return;
        object.morphTargetInfluences[index] = expression === target ? 1 : 0;
      });
    });
  }, [clonedScene, expression]);

  useFrame(() => {
    const robot = group.current;
    if (!robot || !MOVEMENT_ACTIONS.has(action)) return;

    const destination = waypoints[waypointIndex.current] ?? waypoints[waypoints.length - 1];
    if (!destination) return;

    const dx = destination.x - robot.position.x;
    const dz = destination.z - robot.position.z;
    const arrivedX = Math.abs(dx) < 0.08;
    const arrivedZ = Math.abs(dz) < 0.08;
    const speed = action === "Walking" ? 0.1 : 0.18;

    if (!arrivedZ) {
      robot.position.z = stepToward(robot.position.z, destination.z, speed);
      robot.rotation.y = dz > 0 ? 0 : Math.PI;
      latestOnPositionChange.current?.([robot.position.x, robot.position.y, robot.position.z]);
      return;
    }

    if (!arrivedX) {
      robot.position.x = stepToward(robot.position.x, destination.x, speed);
      robot.rotation.y = dx > 0 ? Math.PI / 2 : -Math.PI / 2;
      latestOnPositionChange.current?.([robot.position.x, robot.position.y, robot.position.z]);
      return;
    }

    robot.position.x = MathUtils.lerp(robot.position.x, destination.x, 1);
    robot.position.z = MathUtils.lerp(robot.position.z, destination.z, 1);
    latestOnPositionChange.current?.([robot.position.x, robot.position.y, robot.position.z]);

    if (waypointIndex.current < waypoints.length - 1) {
      waypointIndex.current += 1;
      return;
    }

    if (!hasArrived.current) {
      hasArrived.current = true;
      latestOnArrive.current?.();
    }
  });

  return (
    <group ref={group} position={mountedPosition.current} scale={0.82} dispose={null}>
      <mesh position={[0, -0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.68, 0.68, 0.05, 40]} />
        <meshStandardMaterial color={accentColor} roughness={0.35} />
      </mesh>
      <primitive object={clonedScene} />
    </group>
  );
}
