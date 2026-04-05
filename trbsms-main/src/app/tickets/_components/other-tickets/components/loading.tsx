import Thead from "./thead";

export default function Loading() {
  return (
    <table className="table">
      <Thead />
      <tbody>
        {Array(20)
          .fill(0)
          .map((_, i) => (
            <tr key={i}>
              {Array(7)
                .fill(0)
                .map((_, j) => (
                  <td key={`${i}-${j}`}>
                    <div className="loading" />
                  </td>
                ))}
            </tr>
          ))}
      </tbody>
    </table>
  );
}
